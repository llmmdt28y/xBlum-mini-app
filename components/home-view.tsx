import React, { useRef, useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Dimensions,
  Animated,
  PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Asegúrate de instalar esta librería
// Para el modelo 3D, necesitarás configurar una librería como react-native-gl-model-view o similar.
// Este código es conceptual para la integración y la interactividad.

const { width, height } = Dimensions.get('window');

// Rutas de activos (Asegúrate de tener estos archivos en tu proyecto)
const handGraphic = require('./assets/hand_with_points.png');
const coinTexture = require('./assets/coin_texture.png'); // Si usas textura para el modelo 3D

const HomeView = () => {
  const [activeTab, setActiveTab] = useState('Home');

  // Estado y PanResponder para la rotación de la moneda
  const rotation = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([
        null,
        { dx: rotation.x, dy: rotation.y },
      ], { useNativeDriver: false }),
      onPanResponderRelease: () => {
        // Opcional: animar de vuelta a la posición original o dejar que se detenga
        // Animated.spring(rotation, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
      },
    })
  ).current;

  // Interpolar la rotación para usar en transformaciones
  const rotateX = rotation.y.interpolate({
    inputRange: [-height / 2, height / 2],
    outputRange: ['-180deg', '180deg'],
  });
  const rotateY = rotation.x.interpolate({
    inputRange: [-width / 2, width / 2],
    outputRange: ['-180deg', '180deg'],
  });

  const actionButtons = [
    { name: 'Recargar', icon: 'plus-circle-outline' },
    { name: 'Enviar', icon: 'arrow-up-circle-outline' },
    { name: 'Pagar', icon: 'qrcode-scan' },
    { name: 'Retirar', icon: 'tray-arrow-down' },
  ];

  const recentActivity = [
    { id: 1, title: 'Pago de servicio', subtitle: 'Martes, 11 de Mayo', amount: '-$50.00' },
    { id: 2, title: 'Transferencia recibida', subtitle: 'Lunes, 10 de Mayo', amount: '+$100.00' },
  ];

  const navItems = [
    { name: 'Home', icon: 'home-variant' },
    { name: 'Tarjetas', icon: 'credit-card-outline' },
    { name: 'Actividad', icon: 'clock-outline' },
    { name: 'Perfil', icon: 'account-outline' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Encabezado */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Home</Text>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="bell-outline" size={26} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Contenedor Principal de Balance */}
        <View style={styles.balanceContainer}>
          <View style={styles.balanceTextContainer}>
            <Text style={styles.balanceLabel}>Total balance</Text>
            <Text style={styles.balanceAmount}>$150</Text>
            <View style={styles.balanceChangeRow}>
              <Icon name="arrow-up" size={14} color="#4CAF50" />
              <Text style={styles.balanceChangeText}>+ $2.50 vs yesterday</Text>
            </View>
          </View>

          {/* Sección de la Mano, Puntos y Moneda 3D Giratoria */}
          <View style={styles.graphicSection}>
            <ImageBackground source={handGraphic} style={styles.handAndPoints} resizeMode="contain">
              <Animated.View
                style={[
                  styles.coinWrapper,
                  {
                    transform: [
                      { rotateX: rotateX },
                      { rotateY: rotateY },
                    ],
                  },
                ]}
                {...panResponder.panHandlers}
              >
                {/* Aquí integrarías tu componente de modelo 3D con react-native-gl-model-view o similar */}
                {/* Por ejemplo: <ModelView source={{ zip: 'coin.obj.zip' }} texture={coinTexture} ... /> */}
                {/* Como marcador de posición, usamos una vista coloreada */}
                <View style={styles.coinModelPlaceholder} />
              </Animated.View>
            </ImageBackground>
          </View>
        </View>

        {/* Botones de Acción Rápida */}
        <View style={styles.actionsContainer}>
          {actionButtons.map((btn, index) => (
            <TouchableOpacity key={index} style={styles.actionButton}>
              <View style={styles.actionIconCircle}>
                <Icon name={btn.icon} size={28} color="#007AFF" />
              </View>
              <Text style={styles.actionText}>{btn.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sección de Última Actividad */}
        <View style={styles.activityContainer}>
          <View style={styles.activityHeader}>
            <Text style={styles.activityTitle}>Última actividad</Text>
            <TouchableOpacity>
              <Text style={styles.verMasText}>Ver más</Text>
            </TouchableOpacity>
          </View>
          {recentActivity.map(item => (
            <View key={item.id} style={styles.activityItem}>
              <View style={styles.activityIconCircle}>
                <Icon name="bank-outline" size={22} color="#555" />
              </View>
              <View style={styles.activityItemTextContainer}>
                <Text style={styles.activityItemTitle}>{item.title}</Text>
                <Text style={styles.activityItemSubtitle}>{item.subtitle}</Text>
              </View>
              <Text style={[styles.activityItemAmount, { color: item.amount.startsWith('+') ? '#4CAF50' : '#FF3B30' }]}>
                {item.amount}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Barra de Navegación Inferior */}
      <View style={styles.bottomNav}>
        {navItems.map(item => (
          <TouchableOpacity
            key={item.name}
            style={styles.navItem}
            onPress={() => setActiveTab(item.name)}
          >
            <Icon
              name={item.icon}
              size={24}
              color={activeTab === item.name ? '#007AFF' : '#A0A0A0'}
            />
            <Text style={[styles.navText, { color: activeTab === item.name ? '#007AFF' : '#A0A0A0' }]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Color de fondo oscuro exacto
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100, // Espacio para la navegación inferior
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  iconButton: {
    padding: 5,
  },
  balanceContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff', // Fondo blanco para el contenedor
    borderRadius: 20,
    padding: 20,
    marginVertical: 10,
    height: 180, // Altura aproximada
  },
  balanceTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#555',
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 5,
  },
  balanceChangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  balanceChangeText: {
    fontSize: 14,
    color: '#4CAF50', // Color verde exacto
    marginLeft: 3,
  },
  graphicSection: {
    width: 120, // Ancho aproximado para la sección de gráficos
    justifyContent: 'center',
    alignItems: 'center',
  },
  handAndPoints: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coinWrapper: {
    width: 80, // Tamaño de la moneda
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coinModelPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFD700', // Color dorado para el marcador de posición
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  actionButton: {
    alignItems: 'center',
    width: (width - 60) / 4, // Ancho igual para 4 botones con espacio
  },
  actionIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3, // Sombra para Android
    shadowColor: '#000', // Sombra para iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionText: {
    fontSize: 12,
    color: '#fff',
    marginTop: 8,
    textAlign: 'center',
  },
  activityContainer: {
    marginVertical: 10,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  verMasText: {
    fontSize: 14,
    color: '#007AFF', // Color azul exacto
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
  },
  activityIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityItemTextContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  activityItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  activityItemSubtitle: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  activityItemAmount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 10,
    marginTop: 4,
  },
});

export default HomeView;
