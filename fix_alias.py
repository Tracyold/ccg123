f = "/home/codespace/.bashrc"
s = open(f).read()

s = s.replace(
    "alias gitgo='git add . && git commit -m \"update\" && git push origin main'",
    "alias gitgo='git add . && git commit -m \"update\" && git push origin main'",
)

open(f, "w").write(s)
print("✓ Done")
