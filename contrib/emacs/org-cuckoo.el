(cl-defun org-cuckoo--request (path success &rest args &key data headers type)
  "封装对cuckoo的API的访问。"
  ;; 先构造URL
  ;; 再构造要传给request函数的整个参数列表
  ;; 最后用apply来调用request。
  (let ((url (format "http://localhost:7001%s" path)))
    (apply #'request
           url
           :encoding 'utf-8
           :error (cl-function (lambda (&rest args &key data response &allow-other-keys)
                                 (let ((status-code (request-response-status-code response)))
                                   (if (= status-code 400)
                                       (let ((data (json-read-from-string data)))
                                         (message "%s" (cdr (assoc 'message data))))
                                       (message "Got error: %S" status-code)))))
           :parser 'json-read
           :success success
           :sync t
           args)))

;;; 在cuckoo中创建光标所在任务的定时提醒
(defun scheduled-to-time (scheduled)
  "将TODO条目的SCHEDULED属性转换为UNIX时间戳"
  ;; 为了能够支持形如<2019-06-15 Sat 14:25-14:55>这样的时间戳，会先用正则表达式提取date-to-time能够处理的部分
  (let* ((date (progn
                 (string-match "\\([0-9]+-[0-9]+-[0-9]+ .+ [0-9]+:[0-9]+\\)" scheduled)
                 (match-string 0 scheduled)))
         (lst (date-to-time date)))
    (+ (* (car lst) (expt 2 16))
       (cadr lst))))

(cl-defun create-remind-in-cuckoo (task-id timestamp
                                   &key duration)
  "往cuckoo中创建一个定时提醒并返回这个刚创建的提醒的ID"
  (let (remind-id)
    (org-cuckoo--request
     "/remind"
     (cl-function
      (lambda (&key data &allow-other-keys)
        (message "返回内容为：%S" data)
        (let ((remind data))
          (setq remind-id (cdr (assoc 'id (cdr (car remind))))))))
     :data (json-encode-alist
            (list (cons "duration" duration)
                  (cons "taskId" (number-to-string task-id))
                  (cons "timestamp" timestamp)))
     :headers '(("Content-Type" . "application/json"))
     :type "POST")
    remind-id))

(defun org-cuckoo--extract-task-detail ()
  "")

(defvar *org-cuckoo-default-task-detail-extractor* 'org-cuckoo--extract-task-detail
  "默认的、提取创建cuckoo中的任务时需要的detail参数的值的函数。")
(defvar *org-cuckoo-default-icon-file* nil
  "默认的、创建任务时传给icon_file参数的图片文件路径。")

(defun cuckoo-get-task (id)
  "获取ID这个任务"
  (let (task)
    (org-cuckoo--request
     (concat "/task/" id)
     (cl-function
      (lambda (&key data &allow-other-keys)
        (setq task data))))
    (cdr (car task))))

(defun cuckoo-update-remind (id timestamp)
  "更新指定的提醒的触发时间戳为TIMESTAMP"
  (org-cuckoo--request
   (concat "/remind/" (number-to-string id))
   (cl-function
    (lambda (&key data &allow-other-keys)
      (message "更新了提醒的触发时刻")))
   :data (json-encode (list (cons "timestamp" timestamp)))
   :headers '(("Content-Type" . "application/json"))
   :type "PATCH")
  t)

(defun cuckoo-update-task (id brief detail)
  "更新指定的任务的简述为BRIEF，详情为DETAIL"
  (org-cuckoo--request
   (concat "/task/" (number-to-string id))
   (cl-function
    (lambda (&key data &allow-other-keys)
      (message "更新了任务的简述和详情")))
   :data (encode-coding-string (json-encode (list (cons "brief" brief)
                                                  (cons "detail" detail)
                                                  (cons "state" "active")))
                               'utf-8)
   :headers '(("Content-Type" . "application/json"))
   :type "PATCH")
  t)

(defun create-task-in-cuckoo ()
  "根据光标所在条目创建一个cuckoo中的任务。"
  (interactive)
  (let ((brief)
        (detail)
        (device)
        (duration)
        (icon-file *org-cuckoo-default-icon-file*)
        (remind-id)
        (task-id))

    (setq brief (nth 4 (org-heading-components)))
    (setf detail (funcall *org-cuckoo-default-task-detail-extractor*))
    (setf device (org-entry-get nil "DEVICE"))
    (setf duration (or (org-entry-get nil "DURATION") 60))

    ;; 取出旧的任务和提醒并赋值给task-id和remind-id
    (let ((id (org-entry-get nil "TASK_ID")))
      (when id
        (let ((task (cuckoo-get-task id)))
          (when task
            (setq task-id (cdr (assoc 'id task)))
            (setq remind-id (cdr (assoc 'id (cdr (assoc 'remind task)))))))))
    (message "现在的task-id为：%S" task-id)
    (message "现在的remind-id为：%S" remind-id)

    ;; 如果有task-id则同样只是更新，否则就创建一个新的
    (if task-id
        (cuckoo-update-task task-id brief detail)
      (org-cuckoo--request
       "/task"
       (cl-function
        (lambda (&key data &allow-other-keys)
          (message "data: %S" data)
          (let ((task data))
            (setq task-id (cdr (assoc 'id (cdr (car task)))))
            (message "任务%S创建完毕" task-id))))
       :data (encode-coding-string (json-encode (list (cons "brief" brief)
                                                      (cons "detail" detail)
                                                      (cons "device" device)
                                                      (cons "icon_file" icon-file)))
                                   'utf-8)
       :headers '(("Content-Type" . "application/json"))
       :type "POST"))

    (let* ((scheduled (org-entry-get nil "SCHEDULED"))
           (timestamp (scheduled-to-time scheduled)))
      ;; 如果有remind-id就更新已有的提醒的触发时刻，否则就创建一个新的
      (if remind-id
          (cuckoo-update-remind remind-id timestamp)
        (setq remind-id (create-remind-in-cuckoo task-id timestamp :duration duration))))

    (org-set-property "TASK_ID" (number-to-string task-id))))

;;;###autoload
(defun goto-and-create-task ()
  "先打开条目对应的.org文件再创建cuckoo中的任务"
  (interactive)
  (org-agenda-goto)
  (create-task-in-cuckoo))

;;;###autoload
(cl-defun cuckoo-org-schedule (arg &optional time)
  "调用内置的org-schedule，并在带有一个prefix argument的时候关闭cuckoo中的对应任务"
  (interactive "P")
  (org-schedule arg time)
  (when (= (prefix-numeric-value arg) 1)
    (message "设置了SCHEDULED属性，将会创建对应的cuckoo任务和提醒。")
    (let ((scheduled (org-entry-get nil "SCHEDULED")))
      (unless (string-match " [0-9]+:[0-9]+" scheduled)
        (message "当前SCHEDULED属性没有小时和分钟，无法创建提醒。")
        (return-from cuckoo-org-schedule)))
    (call-interactively 'create-task-in-cuckoo))

  (when (= (prefix-numeric-value arg) 4)
    (message "按下了一个prefix argument，此时应当从cuckoo中删除任务")
    (let ((id (org-entry-get nil "TASK_ID")))
      (org-cuckoo--request
       (concat "/task/" id)
       (cl-function
        (lambda (&key data &allow-other-keys)
          (message "设置了任务%s为【不使用的】" id)))
       :data (encode-coding-string (json-encode (list (cons "state" "inactive")))
                                   'utf-8)
       :headers '(("Content-Type" . "application/json"))
       :type "PATCH"))))

;;;###autoload
(cl-defun cuckoo-done-state ()
  "在当前条目切换至DONE的时候，将相应的cuckoo中的任务的状态也修改为done"
  (let ((state org-state))
    (unless (string= state "DONE")
      (return-from cuckoo-done-state))

    ;; 获取当前条目的TASK_ID属性。如果不存在这个属性，说明没有在cuckoo中创建过任务，无须理会
    (let ((scheduled (org-entry-get nil "SCHEDULED"))
          (task-id (org-entry-get nil "TASK_ID")))
      (unless task-id
        (return-from cuckoo-done-state))
      (when (string-match "\\+[0-9]+.>$" scheduled)
        (message "当前条目会被重复安排，不需要关闭任务%s" task-id)
        (return-from cuckoo-done-state))

      (org-cuckoo--request
       (concat "/task/" task-id)
       (cl-function
        (lambda (&key data &allow-other-keys)
          (message "设置了任务%s为【已完成】" task-id)))
       :data (encode-coding-string (json-encode (list (cons "state" "done")))
                                   'utf-8)
       :headers '(("Content-Type" . "application/json"))
       :type "PATCH"))))

;;;###autoload
(defun cuckoo-cancelled-state ()
  "在当前条目切换至CANCELLED的时候，将相应的cuckoo中的任务的状态也修改为inactive"
  (let ((state org-state))
    (when (string= state "CANCELLED")
      ;; 获取当前条目的TASK_ID属性。如果不存在这个属性，说明没有在cuckoo中创建过任务，无须理会
      (let ((task-id (org-entry-get nil "TASK_ID")))
        (when task-id
          (org-cuckoo--request
           (concat "/task/" task-id)
           (cl-function
            (lambda (&key data &allow-other-keys)
              (message "设置了任务%s为【不使用】" task-id)))
           :data (encode-coding-string (json-encode (list (cons "state" "inactive")))
                                       'utf-8)
           :headers '(("Content-Type" . "application/json"))
           :type "PATCH"))))))

(defun org-cuckoo--get-task-id ()
  "获取光标所在的条目的TASK_ID属性。"
  (org-entry-get nil "TASK_ID"))

(cl-defun org-cuckoo-view-task ()
  "查看当前条目对应的任务的信息。"
  (interactive)
  (let ((task-id (org-cuckoo--get-task-id)))
    (unless task-id
      (message "当前条目没有对应的任务。")
      (return-from org-cuckoo-view-task))
    (org-cuckoo--request
     (concat "/task/" task-id)
     (cl-function
      (lambda (&key data &allow-other-keys)
        (message "请求完毕")
        (let ((task data))
          (message "任务：\n- 标题：%s\n- 详情：%s"
                   (cdr (assoc 'brief (cdr (car task))))
                   (cdr (assoc 'detail (cdr (car task)))))))))))

(define-minor-mode org-cuckoo-mode
  "开启或关闭org-cuckoo的功能。"
  :lighter " cuckoo"
  (add-hook 'org-after-todo-state-change-hook 'cuckoo-cancelled-state)
  (add-hook 'org-after-todo-state-change-hook 'cuckoo-done-state))

(provide 'org-cuckoo)

;;; org-cuckoo.el ends here
