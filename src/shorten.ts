export async function bitlyShortenUrl(url, bitlyAccessToken): Promise<string> {
  console.log('bitlyShortenUrl is shortening URL:', url);
  const data = {
    // "long_url": encodeURI(url)
    long_url: url,
  };
  const response = await fetch('https://api-ssl.bitly.com/v4/shorten', {
    method: 'POST',
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${bitlyAccessToken}`,
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(data), // body data type must match "Content-Type" header
  });
  return response.json();
  // .then(({link}) => {
  //   console.log("Shortening complete; updated SHORTENED_LINK_MAP with", {link});
  //   SHORTENED_LINK_MAP[url] = {link};
  // });
}
