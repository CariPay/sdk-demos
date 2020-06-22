import React, { useState, useEffect } from 'react';
import {
    Platform,
    SectionList,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
} from 'react-native';
import { Camera } from 'expo-camera';
import axios from 'axios';
import {Buffer} from 'buffer';

axios.defaults.headers = {};
axios.interceptors.request.use(request => {
    console.log('Starting Request', request)
    return request
})

axios.interceptors.response.use(response => {
    console.log('Response:', response)
    return response
})

const CameraScreen = (props) => {
    const [hasPermission, setHasPermission] = useState(null);
    const [camera, setCamera] = useState(null);
    const [type, setType] = useState(Camera.Constants.Type.back);
    const [loading, setLoading ] = useState(false);

    const { params } = props.route;
    const { pages, index, label } = params;
    console.log(params)
    const currPage = pages[index];

    useEffect(() => {
      (async () => {
        const { status } = await Camera.requestPermissionsAsync();
        setHasPermission(status === 'granted');
      })();
    }, []);
  
    if (hasPermission === null) {
      return <View />;
    }
    if (hasPermission === false) {
      return <Text>No access to camera</Text>;
    }
    return (
      <View style={{ flex: 1 }}>
        <Camera
            ref={camera => {
                setCamera(camera);
            }}
            style={{ flex: 1,alignItems: 'center', justifyContent: 'center' }}
            type={type}
        >
        <View style={{ flex: 1 }}>
            <View style={styles.instructionsContainer}>
        <Text style={styles.instructions}>Take a picture of the {currPage.label} of your {label}</Text>
            </View>
            <View
                style={{
                flex: 1,
                backgroundColor: 'transparent',
                flexDirection: 'row',
                justifyContent: 'center'
                }}>
                    <TouchableOpacity
                        disabled={loading}
                        style={{
                            flex: 0.1,
                            alignSelf: 'flex-end',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        onPress={async () => {
                            try {
                                setLoading(true)
                                const res = await camera.takePictureAsync({
                                    base64: true,
                                });

                                const destinationPath = currPage.url.path;
                                const buffer = Buffer.from(res.base64, 'base64');

                                const response = await axios.put(destinationPath, buffer, { 'headers': {
                                    'Content-Type': 'image/jpg',
                                }});
                            

                                if (response && response.status === 200) {
                                    if (pages.length == index + 1) {
                                        props.navigation.navigate('Getting Started');
                                    } else {
                                        props.navigation.push('Camera', { ...params, index: index + 1 });
                                    }
                                } else {
                                    console.log(response);
                                }

                            } catch (error) {
                                console.log(error);
                            } finally {
                                setLoading(false);
                            }
                        }}
                    >
                        <View style={styles.button}/>
                    </TouchableOpacity>
            </View>
            </View>
        </Camera>
      </View>
    );
};

const styles = StyleSheet.create({
    button: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 30,
        backgroundColor: 'white'
    },
    instructionsContainer: {
        width: 300,
        height: 50,
        backgroundColor: 'black',
        alignSelf: 'flex-start',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 30,
    },
    instructions: {
        color: 'white',
        lineHeight: 24,
        textAlign: 'center'
    }
});
  

export default CameraScreen;