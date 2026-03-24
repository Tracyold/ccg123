f = "./frontend/pages/index.tsx"
s = open(f).read()

s = s.replace(
    "export default function Home() {",
    """export default function Home() {

  useEffect(() => {
    const overlay = document.querySelector('.bg-blueprint-overlay') as HTMLElement;
    if (!overlay) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = window.innerHeight;
      const progress = Math.min(scrollY / maxScroll, 1);
      const blur = progress * 20;
      const opacity = 1 - progress;
      overlay.style.filter = `blur(${blur}px)`;
      overlay.style.opacity = String(opacity);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);""",
)

open(f, "w").write(s)
print("✓ Done")
