import PlaceForm from "../components/Places/PlaceForm";
import { insertPlace } from "../util/database";

function AddPlace({ navigation }) {
  /**Below, insertPlace function returns a promise, and I only want
    navigate away once we're done inserting a place. Hence, I turned 
    the function below into a async-await function so that we can await 
    insertPlace function before continue the code i.e navigate towards
    AllPlaces screen.  */
  async function createPlaceHandler(place) {
    await insertPlace(place);
    navigation.navigate("AllPlaces");
  }

  return <PlaceForm onCreatePlace={createPlaceHandler} />;
}

export default AddPlace;
