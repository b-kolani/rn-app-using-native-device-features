export class Place {
  constructor(title, imageUri, location, id) {
    this.title = title;
    this.imageUri = imageUri;
    this.address = location.address;
    this.location = {
      lat: location.lat,
      lng: location.lng,
    }; /** The location property 
    itself should be an object that has a latitude property 
    or lat property which is some number, and a longitude 
    property, which is also some number  {lat: 0.141241, lng: 127.121}*/
    this.id = id; /**This should 
    give us a unique ID .*/
  }
}
