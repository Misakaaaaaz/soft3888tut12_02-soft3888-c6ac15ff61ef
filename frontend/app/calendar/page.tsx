'use client';

import * as React from 'react';
import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import Stack from '@mui/joy/Stack';
import Button from '@mui/joy/Button';

import Layout from '@/app/components/layout';
import Header from '@/app/components/header';
import Navigation from '@/app/components/navigation';

import Calendar from './Calendar';

export default function CalendarPage() {
    // Sample initial events
    const initialEvents = [
        { title: 'Meeting with Mark', date: '2023-09-15', time: '10:00 AM', description: 'Discuss Q3 targets.' },
        { title: 'Lunch with Jacob', date: '2023-09-16', time: '12:00 PM', description: 'Catch up on project status.' },
        { title: 'Conference Call', date: '2023-09-17', time: '3:00 PM', description: 'Weekly sync with the team.' }
    ];

    return (
        <CssVarsProvider disableTransitionOnChange>
            <CssBaseline />
            <Layout.Root>
                <Navigation />
                <Header />
                <Layout.Main
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '20px',
                        height: '100%',
                    }}
                >
                    <div style={{
                            marginTop: '800px',
                            marginLeft: '0px',
                            maxWidth: '90%', 
                            maxHeight: '90vh', 
                            width: '100%', 
                            height: 'auto',
                            overflow: 'auto', 
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center', 
                        }}> {}
                        <Calendar initialEvents={initialEvents} sx={{}} />
                    </div>
                </Layout.Main>
            </Layout.Root>
        </CssVarsProvider>
    );
}
