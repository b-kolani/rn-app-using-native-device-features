class Place {
  constructor(title, imageUri, address, location) {
    this.title = title;
    this.imageUri = imageUri;
    this.address = address;
    this.location = location; /** The location property 
    itself should be an object that has a latitude property 
    or lat property which is some number, and a longitude 
    property, which is also some number  {lat: 0.141241, lng: 127.121}*/
    this.id = new Date().toString() + Math.random().toString(); /**This should 
    give us a unique ID .*/
  }
}
