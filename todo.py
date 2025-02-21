# utility script for quickly finding TODO comments in my code
import os

# ANSI escape codes for coloring the output
FILE_COLOR = "\033[32m" # green
LINE_NR_COLOR = "\033[34m" # blue
RESET = "\033[0m"

# controls which file types to search for and any folders to ignore.
allowed_extensions = [".js", ]
ignored_folders = ["node_modules", "gl-matrix"]
match_string = "TODO:"

# recursively search given directory for matching files
def recursive_search(path):
    for f in os.listdir(path):
        file_path = os.path.join(path, f)
        # if file, find todos
        if os.path.isfile(file_path):
            find_todos(file_path)
            continue
        # otherwise, it's a directory. search recursively
        if f not in ignored_folders:
            recursive_search(file_path)

# find any lines containing TODO: in the given file,
# print the result
def find_todos(file_path):
    _, ext = os.path.splitext(file_path)
    if ext not in allowed_extensions:
        return
    matches = []
    with open(file_path, "r") as f:
        for i, line in enumerate(f):
            if match_string in line:
                matches.append(f"\t{line.strip()} {LINE_NR_COLOR}(line {i+1}){RESET}")
    if len(matches) > 0:
        print(f"{FILE_COLOR}File '{file_path}':{RESET}")
        for match in matches:
            print(match)


if __name__ == "__main__":
    cwd = os.getcwd()
    recursive_search(cwd)
