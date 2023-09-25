const GOOGLE_API_KEY =
  "AIvvskghsjhkjlrelmjiferlfgklhkgi4"; /**You must bring your own API keys here.
This key in available on the google maps API website and it require a credit card.
So therefore I will use a dummy api key, but it won't work until you 
bring your own api key. In my case this won't work. You will use this key as a part 
attached to the URL of Maps static API image*/

export function getMapPreview(lat, lng) {
  /**Here in the URL you can tweak the maps image parameters as the zoom, size etc. You can 
    use only one markers instead of more . You can setup also markers color*/
  const imagePreviewUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=14&size=400x200&maptype=roadmap&markers=color:red%7Clabel:S%7C${lat},${lng}&key=${GOOGLE_API_KEY}`;
  return imagePreviewUrl;
}

/**We will use the same API_KEY for translating a location or a pair of coordinates
into a human readable address or the inverse. But here it will fail because I don't
bring the correct Api key.*/
export async function getAddress(lat, lng) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch address!");
  }

  /** If we make it passed this if check, we know that we successfully sent a request to Google's API 
  endpoint and that we get back some address data. So now we can get our response data by calling the json 
  method on the response object and awaiting that, because json returns a promise which eventually resolves
  to the actual response data.*/
  const data = response.json();
  /**We can about this property in data object in the official docs of Google Maps API */
  // const address = data.results[0].formatted_address; I can't use this because the API key is missing
  /**So I will create a dummy  address */
  const address = "Kara, Tg Lama P.";
  /**Since this is a async function, we will actually return a promise, but that promise will eventually resolve
  to this address. Or in case of any errors, it will be rejected with appropriate error.  */
  return address;
}
