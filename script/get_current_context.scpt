tell application "ControlPlane"
	set context to (get current context)
	do shell script "echo " & quoted form of context
end tell