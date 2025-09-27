@echo off
echo Starting Agentic Web3 Chatbot...
echo.
echo Installing dependencies...
call npm run install-all
echo.
echo Starting the application...
call npm run dev
pause

