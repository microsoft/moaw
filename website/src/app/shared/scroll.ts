export function scrollToTop(id?: string, smooth = false) {
  const element = id ? document.getElementById(id) : window;
  element?.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
}

export function scrollToId(id: string, smooth = false) {
  const element = document.getElementById(id.trim());
  if (element) {
    element.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  }
}
