const urlRegex = /(https?:\/\/[^\s]+)/g;

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function extractLinks(inputString) {
  const linksArray = [];

  const modifiedString = inputString.replace(urlRegex, (url) => {
    try {
      const urlObject = new URL(url);
      const domain = escapeHtml(urlObject.hostname);
      const safeUrl = escapeHtml(url);
      linksArray.push(url);
      return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="text-current underline decoration-current/40 underline-offset-2 hover:decoration-current/80 transition-colors">${domain}</a>`;
    } catch {
      return escapeHtml(url);
    }
  });

  return {
    originalString: modifiedString,
    links: linksArray,
  };
}

export default extractLinks;
