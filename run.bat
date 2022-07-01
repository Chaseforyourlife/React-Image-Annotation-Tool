call cd voelidator
start cmd.exe /k "call npm start pause"
call conda init cmd.exe
call conda activate voidtools
call python api.py
pause