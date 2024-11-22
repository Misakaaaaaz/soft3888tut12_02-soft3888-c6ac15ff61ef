'use client';

import * as React from 'react';
import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import Button from '@mui/joy/Button';
import Box from '@mui/joy/Box';
import Input from '@mui/joy/Input';
import Layout from '../../components/layout';
import Header from '../../components/header';
import Navigation from '../../components/navigation';
import '../NewsNotificationsManagement.css';

interface Subscription {
    id: number;
    user_id: number;
    channel_id: number;
    action: string; // 'block' or 'unblock'
}

interface User {
    id: number;
    firstName: string;
    lastName: string;
    channelActionMetadata: string[];
}

interface Channel {
    id: number;
    title: string;
}



export default function ManageSubscribedChannels() {
    const [subscriptionSearchQuery, setSubscriptionSearchQuery] = React.useState('');
    const [subscriptionList, setSubscriptionList] = React.useState<Subscription[]>([]);
    const [filteredSubscriptionList, setFilteredSubscriptionList] = React.useState<Subscription[]>([]);
    
    
    const [userCache, setUserCache] = React.useState<{ [key: number]: User | null }>({}); // 缓存用户数据
    const [channelCache, setChannelCache] = React.useState<{ [key: number]: Channel | null }>({});


    React.useEffect(() => {
        // Fetch subscription list from backend API
        fetchSubscriptions();
    }, []);

    const fetchSubscriptions = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/subscriptions`);
            const result = await response.json();
            const data = result.data;
            const subscriptions: Subscription[] = await Promise.all(
                data.map(async (item: any) => {
                    const user = await fetchUserById(item.userId);
                    return {
                        id: item.id,
                        user_id: item.userId,
                        channel_id: item.channelId,
                        action: determineAction(item.channelId, user) // 根据 permissionMetadata 决定 block/unblock
                    };
                })
            );

            await Promise.all(subscriptions.map(async (subscription) => {
                if (!channelCache[subscription.channel_id]) {
                    const channel = await fetchChannelById(subscription.channel_id);
                    setChannelCache((prev) => ({ ...prev, [subscription.channel_id]: channel }));
                }

                if (!userCache[subscription.user_id]) {
                    const user = await fetchUserById(subscription.user_id);
                    setUserCache((prev) => ({ ...prev, [subscription.user_id]: user }));
                }
            }));


            // alert(JSON.stringify(subscriptions));
            // console.log(subscriptions);

            setSubscriptionList(subscriptions);
            setFilteredSubscriptionList(subscriptions);
        } catch (error) {
            console.error('Error fetching subscriptions:', error);
        }
    };

    const fetchUserById = async (userId: number): Promise<User | null> => {
        if (userCache[userId]) {
            return userCache[userId]; 
        }
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${userId}`, {
                credentials: 'include',
            });
            const user = await response.json();
            return user;
        } catch (error) {
            console.error(`Error fetching user with ID ${userId}:`, error);
            return null;
        }
    };
    const fetchChannelById = async (channelId: number): Promise<Channel | null> => {
        if (channelCache[channelId]) {
            return channelCache[channelId]; 
        }
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/channels/${channelId}`);
            const channel = await response.json();
            return channel;
        } catch (error) {
            console.error(`Error fetching channel with ID ${channelId}:`, error);
            return null;
        }
    };
    const determineAction = (channelId: number, user: User | null) => {
        if (user && user.channelActionMetadata && user.channelActionMetadata[channelId] === 'block') {
            return 'block';
        } else {
            return 'unblock';
        }
    };

    const toggleAction = async (index: number) => {
        const updatedList = [...filteredSubscriptionList];
        const subscription = updatedList[index];

        const user = await fetchUserById(subscription.user_id);
        if (!user) return;

        if (subscription.action === 'block') {
            delete user.channelActionMetadata[subscription.channel_id];
            subscription.action = 'unblock';
        } else {
            user.channelActionMetadata[subscription.channel_id] = 'block';
            subscription.action = 'block';
        }
    
        try {
            await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${subscription.user_id}/channel-action`, {
                credentials: 'include',
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ channelId: subscription.channel_id, action: subscription.action }),
            });
    
            setFilteredSubscriptionList(updatedList);
        } catch (error) {
            console.error('Error updating subscription:', error);
        }
    };
    

    const handleSubscriptionSearchQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSubscriptionSearchQuery(query);
        filterSubscriptions(query);
    };

    const filterSubscriptions = (query: string) => {
        const lowerCaseQuery = query.toLowerCase();
        const filtered = subscriptionList.filter((subscription) => {
            const channel = channelCache[subscription.channel_id];
            const user = userCache[subscription.user_id];
    
            const channelMatch = channel && channel.title.toLowerCase().includes(lowerCaseQuery);
            const userMatch =
                user &&
                `${user.firstName} ${user.lastName}`.toLowerCase().includes(lowerCaseQuery);
    
            return channelMatch || userMatch;
        });
    
        setFilteredSubscriptionList(filtered);
    };

    

    return (
        <CssVarsProvider disableTransitionOnChange>
            <CssBaseline />
            <Layout.Root>
                <Navigation />
                <Header />
                <Layout.Main>
                    <Box sx={{ width: '100%', padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
                        <Button
                            variant="solid"
                            color="primary"
                            component="a"
                            href="/news_notifications/"
                            sx={{
                                backgroundColor: 'grey',
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: 'darkgrey',
                                },
                            }}
                        >
                            ← back to previous page
                        </Button>
                        <h1 style={{ fontSize: '2.0rem', fontWeight: 'bold', marginBottom: '30px' }}>
                            Subscribed News Channels Management
                        </h1>
                        <Input
                            placeholder="Search by channel or subscriber..."
                            value={subscriptionSearchQuery}
                            onChange={handleSubscriptionSearchQueryChange}
                            sx={{ width: '300px', marginBottom: '20px' }}
                        />
                        <Box sx={{ overflowX: 'auto', marginBottom: '40px' }}>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Channel Name</th>
                                        <th>Subscriber Name</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredSubscriptionList.map((subscription, index) => {
                                        const channel = channelCache[subscription.channel_id];
                                        const user = userCache[subscription.user_id];
                                        return (
                                            <tr key={index}>
                                                <td>{channel ? channel.title : 'Loading...'}</td>
                                                <td>{user ? `${user.firstName||''} ${user.lastName||''}` : 'Loading...'}</td>
                                                <td>
                                                    <Button
                                                        variant="soft"
                                                        color={subscription.action === 'block' ? 'danger' : 'success'}
                                                        size="sm"
                                                        onClick={() => toggleAction(index)}
                                                    >
                                                        {subscription.action}
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </Box>
                    </Box>
                </Layout.Main>
            </Layout.Root>
        </CssVarsProvider>
    );
}


