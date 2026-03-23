f = "./frontend/styles/globals.css"
s = open(f).read()

s = s.replace(
    "--scroll-angle:    187deg;\n}",
    "--scroll-angle:    187deg;\n}\n\nbody {\n  font-family: var(--font-body);\n  letter-spacing: 0.15em;\n  text-transform: uppercase;\n}",
)

open(f, "w").write(s)
print("✓ Done")
