import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    View,
    StyleSheet,
    TouchableOpacity,
    Text,
} from 'react-native';
import * as CpApis from 'cp-apis';

import { client } from './App';

const Card = ({ loading, title, onPress }) => (
    <TouchableOpacity disabled={loading} onPress={onPress} style={styles.card}>
        <View style={styles.card}>
            <Text style={styles.title}>{title}</Text>
        </View>
    </TouchableOpacity>
);

const GettingStartedScreen = (props) => {
    const [ uuid, setUuid ] = useState(null);
    const [ loading, setLoading ] = useState(false);

    const accountsApi = new CpApis.AccountsApi(client);
    const urlsApi = new CpApis.UrlsApi(client);

    useEffect(() => {
        const createAccount = async () => {
            try {
                const { data } = await accountsApi.postAccount();
                const { uuid } = data;

                setUuid(uuid);
            } catch (error) {
                console.log(error);
            }
        };
        createAccount();
    }, []);
    const data = [
      {
        schemaUuid: '5296ee21-6597-475b-a2ff-8484bf0a10c4',
        title: 'Identification',
        credentialUuid: '49c39635-4afc-45ce-a089-940ee58a1a9a',
        label: 'Driver\'s Permit',
      },
    ];
    return (
      <View style={styles.container}>
        {
            loading && <ActivityIndicator />
        }
        {
            data.map(({
                credentialUuid,
                schemaUuid,
                label,
            }) => {
                const onPress = async () => {
                    try {
                        setLoading(true);
                        const mime = 'image/jpg';
                        const { data } = await urlsApi.getSignedCredentialUrls(credentialUuid, mime, schemaUuid, uuid);
                        console.log(data);
                        const { pages } = data;

                        if (!pages || !pages.length) {
                            throw new Error('No pages to upload');
                        }
                        props.navigation.push('Camera', {
                            credentialUuid,
                            label,
                            schemaUuid,
                            pages,
                            uuid,
                            index: 0
                        })
                    } catch (error) {
                        console.log(error);
                    } finally {
                        setLoading(false);
                    }
                };

                return (
                    <Card loading={loading} title={label} onPress={onPress} />
                )
            })
        }
      </View>
    );
};

const styles = StyleSheet.create({
    card: {
      height: 120,
      backgroundColor: 'white',
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      ...Platform.select({
        ios: {
          shadowColor: 'rgba(0, 0, 0, 0.3)',
          shadowOffset: {
            height: 0.5,
            width: 0.5,
          },
          shadowOpacity: 0.3,
          shadowRadius: 6,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

export default GettingStartedScreen;