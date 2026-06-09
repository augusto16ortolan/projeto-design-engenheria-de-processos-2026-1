import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialIcons } from "@expo/vector-icons";

import ProductCreateScreen from "../screens/app/ProductCreateScreen";
import ProductDetailsScreen from "../screens/app/ProductDetailsScreen";
import ProductEditScreen from "../screens/app/ProductEditScreen";
import ProductListScreen from "../screens/app/ProductListScreen";
import CartScreen from "../screens/app/CartScreen";
import OrderListScreen from "../screens/app/OrderListScreen";
import { useAuth } from "../context/AuthContext";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function ProductStack() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Products" component={ProductListScreen} />
      <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
      {isAdmin ? (
        <>
          <Stack.Screen name="ProductCreate" component={ProductCreateScreen} />
          <Stack.Screen name="ProductEdit" component={ProductEditScreen} />
        </>
      ) : null}
    </Stack.Navigator>
  );
}

function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#2d7d59",
        tabBarInactiveTintColor: "#69707d",
        tabBarStyle: {
          height: 66,
          paddingTop: 8,
          paddingBottom: 10,
          backgroundColor: "#ffffff",
          borderTopColor: "#eee4d8",
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "800",
        },
        tabBarIcon: ({ color, size }) => {
          const iconName =
            route.name === "ProductsTab" ? "inventory-2" : "receipt-long";

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="ProductsTab"
        component={ProductStack}
        options={{ title: "Produtos" }}
      />
      <Tab.Screen
        name="OrdersTab"
        component={OrderListScreen}
        options={{ title: "Pedidos" }}
      />
    </Tab.Navigator>
  );
}

export default function AppRoutes() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  return (
    <Stack.Navigator
      screenOptions={{
        contentStyle: { backgroundColor: "#f5f1ea" },
        headerStyle: { backgroundColor: "#f5f1ea" },
        headerShadowVisible: false,
        headerTitleStyle: {
          color: "#20242c",
          fontWeight: "800",
        },
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={AppTabs}
        options={{ headerShown: false }}
      />
      {!isAdmin ? (
        <Stack.Screen
          name="Cart"
          component={CartScreen}
          options={{ headerShown: false }}
        />
      ) : null}
    </Stack.Navigator>
  );
}
