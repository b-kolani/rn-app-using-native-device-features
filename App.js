import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AppLoading from "expo-app-loading";

import AllPlaces from "./screens/AllPlaces";
import AddPlace from "./screens/AddPlace";
import IconButton from "./components/UI/IconButton";
import { Colors } from "./constants/colors";
import Map from "./screens/Map";
import { init } from "./util/database";
import PlaceDetails from "./screens/PlaceDetails";

const Stack = createNativeStackNavigator();

export default function App() {
  const [dbInitialized, setDbInitialized] = useState(false);

  /**So here we call init function. And I wanna execute this function 
    whenever the component is executed for the first time. And since I 
    have an empty dependencies array, that is exactly what will happen.
    When the app component was evaluated for the first time, this effect 
    function will execute and we will therefore then init our database.
    Now I actually wanna show the app startup screen, whilst we are still 
    initializing, and we can do this with help of the app loading component.
    So for this we will use the expo app loading package that allows us to 
    prolong the startup screen in the end.*/
  useEffect(() => {
    /**And then here init returns a promise, so we can add then, or wrap this 
    function into async-await function as we did it before in other parts of the
    app as well. But here I'll use this good old, then, method here. And in this 
    anonymous function, which is passed to then, we add the code that should be
    executed if init succeeded. And with that in place, we make sure that we then
    can use this dbInitialized state, to show app loading whilst it's not 
    initialized. Initially it's false and we set it to true, once we're done 
    initializing.*/
    init()
      .then(() => {
        setDbInitialized(true);
      })
      .catch((err) => {
        /**This will handle the error case.*/
        console.log(err);
      });
  }, []);

  /** So this AppLoading component is returned if the database is not initialized yet,
   and this will ensure that we still see the startup screen whilst the app is initializing.*/
  if (!dbInitialized) {
    return <AppLoading />;
  }

  return (
    <>
      <StatusBar style="dark" />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: Colors.primary500 },
            headerTintColor: Colors.gray700,
            contentStyle: { backgroundColor: Colors.gray700 },
          }}
        >
          <Stack.Screen
            name="AllPlaces"
            component={AllPlaces}
            options={({ navigation }) => ({
              title: "Your Favorites Places",
              headerRight: ({ tintColor }) => (
                <IconButton
                  icon="add"
                  size={24}
                  color={tintColor}
                  onPress={() => navigation.navigate("AddPlace")}
                />
              ),
            })}
          />
          <Stack.Screen
            name="AddPlace"
            component={AddPlace}
            options={{ title: "Add a new Place" }}
          />
          <Stack.Screen name="Map" component={Map} />
          <Stack.Screen
            name="PlaceDetails"
            component={PlaceDetails}
            options={{ title: "Loading Place..." }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
