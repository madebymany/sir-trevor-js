/* String to slug */

function toSlug(string)
{
    return string
        .toLowerCase()
        .replace(/[^\w ]+/g,'')
        .replace(/ +/g,'-');
}