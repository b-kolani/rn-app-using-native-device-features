import { Alert, Image, StyleSheet, Text, View } from "react-native";
import {
  launchCameraAsync,
  useCameraPermissions,
  PermissionStatus,
} from "expo-image-picker";
import { useState } from "react";

import { Colors } from "../../constants/colors";
import OutlinedButton from "../UI/OutlinedButton";

function ImagePicker({ onTakeImage }) {
  const [pickedImage, setPickedImage] = useState();

  /**On Android it asked automatically for permissions when it comes 
  to take photos, on iOS that's not happening, there we need to manage
  this ourselves.This hook will help us, it returns an array of two items
  and the second or the latter in this array, is a function, is very important
  for us here on iOS where we didn't have the appropriate permissionsimport ImagePicker from './ImagePicker';
. */
  const [cameraPermissionInformation, requestPermission] =
    useCameraPermissions();

  /**With this function below, I wanna check if we already have permission
    to use the camera because the first time we're using it, we will have to grant
    permissions, but for a subsequent uses, we of course already have permissions
    and we then don't wanna try to request permission again.*/
  async function verifyPermissions() {
    if (cameraPermissionInformation.status === PermissionStatus.UNDETERMINED) {
      /**Here we check if status is undetermined, which means we don't know yet if 
    we have access or not, if we have the permission to use the camera. And this would
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
    if (cameraPermissionInformation.status === PermissionStatus.DENIED) {
      Alert.alert(
        "Insufficient Permissions!",
        "You need to grant camera permissions to use this app."
      );
      /**Here I will return false because verifyPermissions should return true if
      camera access was granted, and false otherwise. And in this case we don't have 
      the permission to use the camera. */
      return false;
    }

    /**If we make it into neither of these if-checks above, i.e if the status is either not undermined
    nor denied, so we do have the permission to use the camera and hence I'll return true here.*/
    return true;
  }

  async function takeImageHandler() {
    const hasPermission = await verifyPermissions();

    /**Here, I will check if hasPermission is false if we don't have the 
    permission, hence the exclamation mark.In this case we just to cancel
    the execution of the rest of the function below this if block, so that we 
    don't try to launch the camera because we don't have permission to do so 
    anyways.Otherwise, however, we should be able to continue.*/
    if (!hasPermission) {
      return;
    }

    /**We can execute this function here like this to 
    launch the device's camera, but as the name async 
    already suggests, this will return a promise because 
    of course it does'nt finish immediately, instead it wait
    for the user to press the camera button to take a photo
    and this function therefore won't finish execution 
    before that photo was taken.So it will wait for the user 
    to take a photo. Hence we wanna wait for this as well, 
    before we try to work with that photo because the photo 
    only exists after this function below have finished execution.
    And hence we can convert our takeImageHandler into a async 
    function so that we can use the await keyword with this inner 
    function.*/
    const image = await launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.5,
    });

    setPickedImage(image.assets[0].uri);
    onTakeImage(image.assets[0].uri);
  }

  let imagePreview = <Text>No image taken yet.</Text>;

  if (pickedImage) {
    imagePreview = <Image style={styles.image} source={{ uri: pickedImage }} />;
  }
  return (
    <View>
      <View style={styles.imagePreview}>{imagePreview}</View>
      <OutlinedButton icon="camera" onPress={takeImageHandler}>
        Take Image
      </OutlinedButton>
    </View>
  );
}

export default ImagePicker;

const styles = StyleSheet.create({
  imagePreview: {
    width: "100%",
    height: 200,
    marginVertical: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.primary100,
    borderRadius: 4,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
