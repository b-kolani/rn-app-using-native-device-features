import { useEffect, useState } from "react";
import { Alert, Image, StyleSheet, Text, View } from "react-native";
import {
  PermissionStatus,
  getCurrentPositionAsync,
  useForegroundPermissions,
} from "expo-location";
import { getAddress, getMapPreview } from "../../util/location";
import {
  useNavigation,
  useRoute,
  useIsFocused,
} from "@react-navigation/native";

import OutlinedButton from "../UI/OutlinedButton";
import { Colors } from "../../constants/colors";

function LocationPicker({ onPickLocation }) {
  const [pickedLocation, setPickedLocation] = useState();

  /** This hook will return a boolean. This will be true if the 
  screen is currently focused and false otherwise. So when we move 
  from AddPlace to the Map screen, this will yield false. I'm
  calling this in a component, which isn't a screen component but
  of course, this component is part of a screen component, so this will
  be true whenever the screen component to which this component belongs
  is the main screen and it will be false otherwise. The reason of this 
  is because when we go back to the AddPlace screen each time a location 
  is picked and display it in this component it won't work. This behavior 
  occurs because of the stack navigator, as we go back the AddPlace is not 
  recreated it is preserved, so the picked location won't appear in this 
  component. Therefore with the help of this hook we fix it. Hence, this
  will switch to false when we enter the map and true when we come back 
  from the map.*/
  const isFocused = useIsFocused();

  const navigation = useNavigation();
  /**This hook will help us get parameters or data passed to
  this root or screen. */
  const route = useRoute();

  const [locationPermissionInformation, requestPermission] =
    useForegroundPermissions();

  useEffect(() => {
    if (isFocused && route.params) {
      /** Here we check if isFocused and the route.params is truthy. So if we do have
    route.params and isFocused is truthy, which will be the case if we are coming back 
    from the Map screen but which will not be the case when we first 
    visit the AddPlace screen, example if I'm coming from the 
    starting screen, and I land on the AddPlace screen, then we won't
    have any route parameters because then no parameters are passed as part 
    of the screen navigation. But if we are coming back from the Map screen
    after picking a location, then we will have route parameters.*/
      const mapPickedLocation = {
        lat: route.params.pickedLat,
        lng: route.params.pickedLng,
      };
      //console.log(mapPickedLocation);
      setPickedLocation(mapPickedLocation);
    }
  }, [route, isFocused]);

  /** When a location is pecked or when we located
  the user or picked a location on the map.  
  Either way, it's fair to assume that setPickedLocation 
  will have been called and the pickedLocation state will
  have been updated. So in order to executed onPickLocation
  function with the latest state, whenever that state changed,
  we can add another effect with useEffect. Here, our 
  dependency is pickedLocation, therefore, we don't need to worry
  about this component being focused or not. Whenever the picked
  location state was changed, the component will be guaranteed to
  be reevaluated because that is how React works. If a component 
  state changes, the component is reevaluated. And to avoid 
  unnecessary reevaluations of this component function or even an 
  infinite loop, I wanna make sure that the onPickLocation function
  doesn't change unnecessarily, because whenever it does change, 
  this effect function will be executed again. Therefore, in the place
  where the function onPickLocation is defined i.e in the PlaceForm 
  component, I wanna wrap this function with useCallback hook, and 
  we therefore avoid running this effect unnecessarily.*/
  useEffect(() => {
    async function handleLocation() {
      if (pickedLocation) {
        const address = await getAddress(
          pickedLocation.lat,
          pickedLocation.lng
        );
        onPickLocation({
          ...pickedLocation,
          address: address,
        }); /**Here I'm using a dummy address because
        the Google Maps api key is missing and can get the real address with the Key it must be address: address*/
      }
    }

    handleLocation();
  }, [pickedLocation, onPickLocation]);

  async function verifyPermissions() {
    if (
      locationPermissionInformation.status === PermissionStatus.UNDETERMINED
    ) {
      /**Here we check if status is undetermined, which means we don't know yet if 
      we have access or not, if we have the permission to use the location. And this would
      be the case because the user hasn't been asked yet.In that case, we want to call 
      requestPermission function provided by the hook in the array, to get that permission.
      And that is an asynchronous function because it will open a dialog and wait for the 
      user's response; therefore, it returns a promise, and that's why I used async here on 
      the outer function so we can await this.*/
      const permissionResponse = await requestPermission();

      /**Either way, we can return permissionResponse.granted here, which is a property that's
        true if the permission has been granted, and false otherwise,*/
      return permissionResponse.granted;
    }

    /**Here we check if status is equal to one of the other built-in statuses, denied status,
      which means we don't have permission.    */
    if (locationPermissionInformation.status === PermissionStatus.DENIED) {
      Alert.alert(
        "Insufficient Permissions!",
        "You need to grant location permissions to use this app."
      );
      /**Here I will return false because verifyPermissions should return true if
        location access was granted, and false otherwise. And in this case we don't have 
        the permission to use the location. */
      return false;
    }

    /**If we make it into neither of these if-checks above, i.e if the status is either not undermined
      nor denied, so we do have the permission to use the location and hence I'll return true here.*/
    return true;
  }

  async function getLocationHandler() {
    const hasPermission = await verifyPermissions();

    if (!hasPermission) {
      return;
    }

    const location = await getCurrentPositionAsync();
    //console.log(location);
    setPickedLocation({
      lat: location.coords.latitude,
      lng: location.coords.longitude,
    });
  }

  function pickOnMapHandler() {
    navigation.navigate("Map");
  }

  let locationPreview = <Text>No location picked yet.</Text>;

  if (pickedLocation) {
    //console.log(pickedLocation);
    locationPreview = (
      <Image
        style={styles.image}
        source={{
          uri: getMapPreview(pickedLocation.lat, pickedLocation.lng),
        }}
      />
    );
  }

  return (
    <View>
      <View style={styles.mapPreview}>{locationPreview}</View>
      <View style={styles.actions}>
        <OutlinedButton icon="location" onPress={getLocationHandler}>
          Locate User
        </OutlinedButton>
        <OutlinedButton icon="map" onPress={pickOnMapHandler}>
          Pick on Map
        </OutlinedButton>
      </View>
    </View>
  );
}

export default LocationPicker;

const styles = StyleSheet.create({
  mapPreview: {
    width: "100%",
    height: 200,
    marginVertical: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.primary100,
    borderRadius: 4,
    overflow: "hidden",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    //borderRadius: 4,
  },
});
