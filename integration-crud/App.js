import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";

import { AuthProvider } from "./src/context/AuthContext";
import { CartProvider } from "./src/context/CartContext";
import { CustomAlertProvider } from "./src/context/CustomAlertContext";
import Routes from "./src/routes/Routes";

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <CustomAlertProvider>
          <NavigationContainer>
            <Routes />
          </NavigationContainer>
          <StatusBar style="auto" />
        </CustomAlertProvider>
      </CartProvider>
    </AuthProvider>
  );
}
