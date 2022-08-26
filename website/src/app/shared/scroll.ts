export function scrollToTop(smooth = false) {
  window.scrollTo({ top: 0, behavior: smooth ?'smooth' : 'auto' });
}

export function scrollToId(id: string, smooth = true) {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  }
}
