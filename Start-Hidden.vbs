Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
strPath = fso.GetParentFolderName(WScript.ScriptFullName)

' Mở trình duyệt web
WshShell.Run "cmd /c start http://localhost:3000", 0, False

' Chạy Node server ngầm hoàn toàn không hiện cửa sổ cmd (0 = ẩn hoàn toàn)
WshShell.Run "cmd /c cd /d """ & strPath & """ && node src/server.js", 0, False
