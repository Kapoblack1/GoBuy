import React, { useState, useCallback, useEffect } from 'react';
import { GiftedChat, Bubble, InputToolbar, Composer, Send } from 'react-native-gifted-chat';
import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity } from 'react-native';
import james from '../../assets/imagens/avatar.webp';
import { CaretLeft } from "phosphor-react-native";

import { LogBox } from 'react-native';


export default function ChatScreen() {

    const [messages, setMessages] = useState([]);
    LogBox.ignoreAllLogs(true);
    useEffect(() => {
        setMessages([
            {
                _id: 1,
                name: 'Cleusia dos Anjos',
                text: 'Hello developer',
                createdAt: new Date(),
                user: {
                    _id: 2,
                    name: 'Romeno do Rosário',
                },
            },
        ]);
    }, []);

    const onSend = useCallback((messages = []) => {
        setMessages(previousMessages => GiftedChat.append(previousMessages, messages));
    }, []);

    const renderBubble = (props) => {
        return (

            <View style={{ paddingBottom: 20 }}>
                <Bubble
                    {...props}
                    wrapperStyle={{
                        right: {
                            backgroundColor: '#704F38',
                            borderBottomRightRadius: 0,
                            fontFamily: 'Poppins_400Regular',
                            padding: 5,

                        },
                        left: {
                            backgroundColor: 'white',
                            borderBottomLeftRadius: 0,
                            fontFamily: 'Poppins_400Regular',
                            padding: 5,
                        },
                    }}
                    textStyle={{
                        right: {
                            color: 'white',
                            fontFamily: 'Poppins_400Regular',
                        },
                        left: {
                            color: '#000000',
                            fontFamily: 'Poppins_400Regular',
                        },
                    }}
                />
            </View>
        );
    };

    const renderInputToolbar = (props) => {
        return (
            <InputToolbar
                {...props}
                containerStyle={{
                    backgroundColor: 'white',
                    fontFamily: 'Poppins_400Regular',
                }}
            />
        );
    };

    const renderSend = (props) => {
        return (
            <Send
                {...props}
                containerStyle={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    alignSelf: 'center',
                    alignContent: 'center',
                    marginRight: 10,
                    backgroundColor: '#704F38',
                    paddingRight: 15,
                    paddingLeft: 15,
                    borderRadius: 30,
                }}
            >
                <View >
                    <Text style={{ color: 'white' }}>Enviar</Text>
                </View>
            </Send>
        );
    };

    const renderComposer = (props) => {
        return (
            <Composer
                {...props}
                textInputStyle={{
                    color: 'black',
                    backgroundColor: '#f5f5f5',
                    borderRadius: 5,
                    marginHorizontal: 15,
                    marginTop: 15,
                    marginBottom: 15,
                    fontFamily: 'Poppins_400Regular',
                }}
            />
        );
    };

    /*const renderAvatar = (props) => {
        // Only render an avatar for messages from other users
        if (props.currentMessage.user._id !== props.user._id) {
            return (
                <View style={{ marginBottom: 20 }}>
                    <Image
                        source={props.currentMessage.user.avatar}
                        style={styles.avatar}
                    />
                </View>
            );
        }
        return null;
    };*/

    return (

        <SafeAreaView style={styles.safeArea}>

            <View style={styles.header}>

                <TouchableOpacity>
                    <CaretLeft size={24} color='white'></CaretLeft>
                </TouchableOpacity>

                <Image
                    source={james}
                    style={styles.pfp}
                    resizeMode="cover"
                />

                <View style={{ marginLeft: 10 }}>
                    <Text style={styles.name}>Romeno do Rosário</Text>
                    <Text style={styles.status}>Online</Text>
                </View>


            </View>

            <View style={styles.textsContainer}>

                <GiftedChat
                    messages={messages}
                    onSend={(messages) => onSend(messages)}
                    user={{
                        _id: 1,
                    }}
                    renderBubble={renderBubble}
                    renderInputToolbar={renderInputToolbar}
                    renderComposer={renderComposer}
                    renderSend={renderSend}
                    placeholder="Type a message here..."
                    alwaysShowSend={false}
                    scrollToBottom={true}
                />

            </View>

        </SafeAreaView>

    );


}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#704F38',
    },
    header: {
        backgroundColor: '#704F38',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
    },
    pfp: {
        width: 50,
        height: 50,
        borderRadius: 30,
        marginLeft: 20,
    },
    textsContainer: {
        flex: 1,
        backgroundColor: '#e8e8e8',
        borderTopLeftRadius: 50,
        borderTopRightRadius: 50,

    },
    status: {
        color: 'white',
        fontSize: 14,
        fontFamily: 'Poppins_400Regular',

    },
    name: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'Poppins_500Medium',

    },
    avatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginRight: 5,
    },
    username: {
        color: '#000000',
        fontSize: 12,
        fontFamily: 'Poppins_400Regular',
    },
    bubbleFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
        marginLeft: 5,
    },
});
