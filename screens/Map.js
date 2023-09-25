import { useCallback, useLayoutEffect, useState } from "react";
import { Alert, StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";

import IconButton from "../components/UI/IconButton";

function Map({ navigation, route }) {
  /**So here initialLocation will be undefined if route.params is undefined i.e 
    no params is passed. So when we add a place that should still work as before
    but we should now also be able to view this map with an initialLocation selected
    if we have an initialLocation.*/
  const initialLocation = route.params && {
    lat: route.params.initialLat,
    lng: route.params.initialLng,
  };

  const [selectedLocation, setSelectedLocation] = useState(initialLocation);

  /**Latitude and longitude will define the center of the map. And the deltas 
    will basically define how much content besides the center will be visible. It
    indirectly sets the zoom level of the map. */
  const region = {
    latitude: initialLocation ? initialLocation.lat : 37.78,
    longitude: initialLocation ? initialLocation.lng : -122.43,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  function selectLocationHandler(event) {
    //console.log(event);
    /**Here I added a check and check if we do have an initialLocation
    which means we are in read-only mode in the end. So we avoid moving
    the marker as we have in view mode, instead of adding a place. */
    if (initialLocation) {
      return;
    }
    const lat = event.nativeEvent.coordinate.latitude;
    const lng = event.nativeEvent.coordinate.longitude;

    /**I'm doing this because now the component 
    will be re-evaluated after selecting a location. */
    setSelectedLocation({ lat: lat, lng: lng });
  }

  /**Since I'm passing this function in the useLayoutEffect dependency array 
  to avoid a wide multiple re-render cycles or potentially even infinite loops, 
  I will wrap this function with React's use callback hook. Which helps us to
  ensure that a function defined inside of a component is not recreated 
  unnecessarily. And the useCallback hook is required because this function
  is used as a dependency in another effect. And I wanna avoid that the 
  useLayoutEffect is re-executed unnecessarily.*/
  const savePickedLocationHandler = useCallback(() => {
    if (!selectedLocation) {
      Alert.alert(
        "No location picked!",
        "You have to pick a location (by tapping on the map) first!"
      );
      return;
    }

    /**So now we can use this navigation prop here. And we could go 
    back by calling goback() method on the navigation object. But the more
    elegant approach which allows us to also pass some data along, is to call
    navigate and go back to AddPlace. React navigation will automatically detect
    that this is the screen we're coming from and play the appropriate back 
    navigation. So it will automatically handle this correctly. But by using 
    navigate here, we can pass a second argument to navigate, to pass some 
    parameters to that screen. Yes, you can also do that when going back because
    we're still navigating from screen a to b or in this case, maybe b to a.
    But still it's a navigation from one screen to another hence, when using the
    navigate method we can pass some parameters along some data.*/
    navigation.navigate("AddPlace", {
      pickedLat: selectedLocation.lat,
      pickedLng: selectedLocation.lng,
    });
  }, [navigation, selectedLocation]); /**So whenever the navigation prop or the 
  selectedLocation state value changes, this function will be recreated. Otherwise 
  it won't. And this can help us improve performance a little bit by avoiding unnecessary
  rerender cycles or even help us stop infinite loops.
   */

  useLayoutEffect(() => {
    /**So the code below i.e show the save location button this if statement, will not be 
    executed because of the return statement here. So the if statement acts as a guard where 
    the code outside won't be executed if we have an initialLocation, because then we know 
    that we're in view mode, in read-only mode so to say, and we won't be able to change the 
    location anyways hence this header button shouldn't be shown.
    */
    if (initialLocation) {
      return;
    }
    navigation.setOptions({
      headerRight: ({ tintColor }) => (
        <IconButton
          icon="save"
          size={24}
          color={tintColor}
          onPress={savePickedLocationHandler}
        />
      ),
    });
  }, [navigation, savePickedLocationHandler, initialLocation]);

  return (
    <MapView
      style={styles.map}
      initialRegion={region}
      onPress={selectLocationHandler}
    >
      {selectedLocation && (
        <Marker
          title="Picked Location"
          coordinate={{
            latitude: selectedLocation.lat,
            longitude: selectedLocation.lng,
          }}
        />
      )}
    </MapView>
  );
}

export default Map;

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});
