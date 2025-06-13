import React, { useState, useEffect } from "react";
import {
    SafeAreaView,
    StyleSheet,
    View,
    Text,
    FlatList,
    TouchableOpacity,
    SectionList,
} from "react-native";
import { BellSimple } from "phosphor-react-native";
import Header from '../components/Header';
import BottomNavigation from "../components/BottomNavigation";


const NotificationScreen = () => {

    const [notifications, setNotifications] = useState([
        { id: "1", title: "Pedido entregue", description: "O seu pedido foi entregue ao vendedor, em breve estará em suas mãos", date: "HOJE", read: false },
        { id: "2", title: "Pedido entregue", description: "O seu pedido foi entregue ao vendedor, em breve estará em suas mãos", date: "ONTEM", read: true },
        { id: "3", title: "Pedido entregue", description: "O seu pedido foi entregue ao vendedor, em breve estará em suas mãos", date: "ONTEM", read: true },
        { id: "4", title: "Pedido entregue", description: "O seu pedido foi entregue ao vendedor, em breve estará em suas mãos", date: "11/12/2024", read: false },
        { id: "5", title: "Pedido entregue", description: "O seu pedido foi entregue ao vendedor, em breve estará em suas mãos", date: "11/12/2024", read: true },
        { id: "6", title: "Pedido entregue", description: "O seu pedido foi entregue ao vendedor, em breve estará em suas mãos", date: "ONTEM", read: true },
    ]);

    // Group notifications by date
    const groupedNotifications = notifications.reduce((acc, notification) => {
        const { date } = notification;
        acc[date] = acc[date] || [];
        acc[date].push(notification);
        return acc;
    }, {});

    // Convert grouped notifications into section list data
    const sections = Object.keys(groupedNotifications).map(date => ({
        title: date,
        data: groupedNotifications[date],
    }));

    const renderSectionHeader = ({ section: { title } }) => (
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>{title}</Text>
        </View>
    );

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.notificationItem, item.read ? styles.read : styles.unread]}
            onPress={() => {
                //markAsRead(item.id);
            }}
        >
            <View style={styles.iconContainer}>
                <BellSimple size={32} style={{ borderRadius: 10 }} color={'#704F38'} />
            </View>
            <View style={styles.notificationContent}>
                <Text style={styles.notificationTitle}>{item.title}</Text>
                <Text style={styles.notificationDescription}>{item.description}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <Header page="Notificações"></Header>

            <SectionList
                sections={sections}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                renderSectionHeader={renderSectionHeader}
                contentContainerStyle={styles.listContainer}
            />
            
        </SafeAreaView>
    );


};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#FFF", // ou a cor de
    },
    scrollViewStyle: {
        flex: 1,
    },
    container: {
        marginHorizontal: 13,
        backgroundColor: "#FFF",
    },
    center: {
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center",
    },
    sectionHeader: {
        marginBottom: 10,
        marginTop: 10,
        marginLeft: 10,

    },
    sectionHeaderText: {

        fontFamily: 'Poppins_400Regular',
        fontSize: 18,
        color: '#704F38',

    },
    header: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: "space-between",
        alignContent: "center",
        alignItems: "center",
        width: '100%',
    },
    headerText: {
        fontSize: 24,
        fontWeight: "300",
        margin: 16,
        fontFamily: 'Poppins_400Regular',
        width: '80%',
    },
    itemContainer: {
        flexDirection: "row",
        padding: 16,
        alignItems: "center",
        borderBottomColor: '#DEDEDE',
        borderBottomWidth: 1,
    },
    listContainer: {
    },
    notificationItem: {
        flex: 1,
        display: 'flex',
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#e8e8e8',
        padding: 10,
        width: '100%',
    },
    read: {
        // styles for read notifications
    },
    unread: {
        // styles for unread notifications
    },
    iconContainer: {
        backgroundColor: '#E8E8E8',
        borderRadius: 80,
        width: '14.5%',
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'center',
    },
    notificationContent: {
        marginLeft: '5%',
        width: '83%',
    },
    notificationTitle: {
        fontFamily: 'Poppins_400Regular',

    },
    notificationDescription: {
        fontFamily: 'Poppins_400Regular',
        color: '#a9a9a9',

    },
    closeButton: {
        // styles for close button in modal
    },
    modalView: {
        // styles for modal view
    },
    modalText: {
        // styles for modal text
    },
    // Add any additional styles you need
});

export default NotificationScreen;
