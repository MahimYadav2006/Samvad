function extractLinks(inputString){
    // Regex
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    const linksArray = [];

    const modifiedString = inputString.replace(urlRegex,(url)=>{   // This scans the string for all URLs matching the regex. For each match (url), the callback function is called.
        const urlObject = new URL(url);  //Creates a URL object from the string — allows us to easily extract parts like hostname, pathname, etc.
        const domain = urlObject.hostname;
        linksArray.push(url);
        return `<span class="text-black underline"> <a href="${url}" target="_blank">${domain}</a> </span>`;
    })

    return {
        originalString: modifiedString,
        links: linksArray,
    };
}

export default extractLinks;