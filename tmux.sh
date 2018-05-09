#!/bin/bash
SESSION=nodecms
#tmux="tmux -2 -f tmux.conf"
tmux="tmux"

# if the session is already running, just attach to it.
$tmux has-session -t $SESSION
if [ $? -eq 0 ]; then
  echo "Session $SESSION already exists. Attaching."
  sleep 1
  $tmux -CC attach -t $SESSION
  exit 0;
fi

# create a new session, named $SESSION, and detach from it
$tmux new-session -d -s $SESSION

$tmux new-window -t $SESSION:0
$tmux rename-window 'app'
$tmux send-keys "git status" C-m
$tmux split-window  -h -t $SESSION:0
$tmux send-keys "git pull origin master && npm run docker:rebuild" C-m

$tmux select-window -t $SESSION:0
$tmux select-pane -t 1
$tmux select-pane -t 0
$tmux -CC attach -t $SESSION
