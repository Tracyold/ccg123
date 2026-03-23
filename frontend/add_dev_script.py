f = "package.json"
s = open(f).read()

s = s.replace('"scripts": {', '"scripts": {\n    "dev": "next dev -p 3000 -H 0.0.0.0",')

open(f, "w").write(s)
print("✓ Done")
