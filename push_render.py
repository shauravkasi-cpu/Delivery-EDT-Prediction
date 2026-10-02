import subprocess

def run(cmd):
    print("RUNNING:", " ".join(cmd))
    res = subprocess.run(cmd, capture_output=True, text=True, cwd=r"c:\Users\shaur\New folder")
    print("STDOUT:", res.stdout)
    print("STDERR:", res.stderr)
    print("EXIT CODE:", res.returncode)

run(["git", "add", "."])
run(["git", "commit", "-m", "Configure Render deployment: add requirements.txt, Procfile, build.sh, render.yaml, and static serving in Flask"])
run(["git", "push", "origin", "main"])
