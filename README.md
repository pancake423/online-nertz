1. Files of interest
There is a lot of code here, and only some of it is directly related to the assignment. Most of it is
for the Nertz implementation and not the AI model.

The following folders and files contain relevant code:
learning_agent: this contains all the code for the rule-based agent, genetic algorithm, and training procedure.
shared: This folder contains the logical implementation of Nertz rules.
analysis: This folder contains python scripts that are used to create the charts in the report.
data: This folder contains the raw data logs from training the AI.

2. Setup and programs
This project was written on linux and uses Node.js and Python. The game itself is played on the web,
so it requires a browser. The development environment is listed below. Other versions of Linux and other browsers
will most likely work, but haven't been tested.
TODO: test on the standard grading environment machine

Environment:
OS: Linux Mint 22
Browser: Firefox
Python: v3.12
Node.js: v18

Setup:
install Node.js.
open the project folder in the command line.
run "npm install" to install the project's dependencies.
TODO: may need to install python libraries?


There are a few different programs within that may be of interest to run.

Web server and game:
run "npm run start" to start the web server.
The game will be available at the address "localhost:3000/".

There is also a tool for replaying matches from game logs at "localhost:3000/replay/html".
Move logging is disabled by default, because it takes up a lot of space, so there are no games
to replay. This tool was mostly used for qualitative analysis and bugfixing during testing.

Learning agent:
This program trains the agents using a genetic algorithm.
run "npm run train" to run the training program. This will take a long time, especially on slower machines.

Data Analysis:
This program that creates the charts and graphs seen in the report, based on logged run data.

run "python3 analysis/main.py" to run the graphing program. Close out the window for the current graph to
go to the next graph.
