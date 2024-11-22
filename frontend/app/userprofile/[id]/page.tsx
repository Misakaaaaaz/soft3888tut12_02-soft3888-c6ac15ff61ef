'use client';

import * as React from 'react';
import {
  AspectRatio,
  Box,
  Button,
  Divider,
  Card,
  CardActions,
  CardOverflow,
  List,
  ListItem,
  ListItemDecorator,
  ListDivider,
  Avatar,
  Stack,
  Table,
} from '@mui/joy';
import { useParams } from 'next/navigation';
import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import Layout from '@/app/components/layout';
import Header from '@/app/components/header';
import Navigation from '@/app/components/navigation';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useEffect, useState } from 'react';

interface School {
  id: string;
  name: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profile: string;
  school: School | string | null;
  access: string;
  profileImage: string;
  relatedUsers: User[]; // Adjusted to store user objects
}

export default function UserProfilePage() {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const params = useParams();
  const id = params.id;

  // Commented out pxToRem references
  // const pxToRem = (size: number): string => `${size / 16}rem`;
  // const styles = {
  //   fontSize: pxToRem(24),
  // };

  useEffect(() => {
    if (id) {
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${id}`, {
        method: 'GET', // Optional, GET is the default
        credentials: 'include', // Ensures cookies are sent with the request
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error('User not found');
          }
          return res.json();
        })
        .then((data) => setUser(data))
        .catch((error) => console.error('Failed to fetch user details:', error));
    }
  }, [id]);

  if (!user) return <div>No Users...</div>;

  return (
    <CssVarsProvider disableTransitionOnChange>
      <CssBaseline />
      <Layout.Root>
        <Navigation />
        <Header />
        <Layout.Main>
          <Button
            variant="solid"
            color="primary"
            component="a"
            href="/usermanagement/"
            sx={{
              backgroundColor: '#007BFF', // Primary blue
              color: 'white',
              '&:hover': {
                backgroundColor: '#0056b3', // Darker blue on hover
              },
            }}
          >
            ← Back to User Management
          </Button>

          <h1 style={{ fontSize: '2.0rem', fontWeight: 'bold', marginBottom: '30px' }}>
            User Profile
          </h1>

          <Card>
            <Box sx={{ mb: 1 }}>
              <h2 style={{ fontSize: '2.0rem', fontWeight: 'bold', marginBottom: '30px' }}>
                Basic Information
              </h2>
            </Box>
            <div>
              <List aria-labelledby="decorated-list-demo">
                <ListItem>
                  <Box display="flex" alignItems="center" gap={20}>
                    <ListItemDecorator>First Name</ListItemDecorator>
                    {user.firstName}
                  </Box>
                </ListItem>
                <ListDivider />
                <ListItem>
                  <Box display="flex" alignItems="center" gap={20}>
                    <ListItemDecorator>Last Name</ListItemDecorator>
                    {user.lastName}
                  </Box>
                </ListItem>
                <ListDivider />
                <ListItem>
                  <Box display="flex" alignItems="center" gap={25}>
                    <ListItemDecorator>Email</ListItemDecorator>
                    {user.email}
                  </Box>
                </ListItem>
                <ListDivider />
                <ListItem>
                  <Box display="flex" alignItems="center" gap={24}>
                    <ListItemDecorator>Profile</ListItemDecorator>
                    {user.profile}
                  </Box>
                </ListItem>
                <ListDivider />
                <ListItem>
                  <Box display="flex" alignItems="center" gap={23}>
                    <ListItemDecorator>Access</ListItemDecorator>
                    {user.access}
                  </Box>
                </ListItem>
                <ListDivider />
                <ListItem>
                  <Box display="flex" alignItems="center" gap={17}>
                    <ListItemDecorator>Profile Image</ListItemDecorator>
                    <Avatar
                      src={user.profileImage}
                      alt="Profile"
                      sx={{ width: '3rem', height: '3rem' }}
                    >
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </Avatar>
                  </Box>
                </ListItem>
              </List>
            </div>
            <CardOverflow sx={{ borderTop: '1px solid', borderColor: 'divider' }} />
          </Card>

          <Card>
            <Box sx={{ mb: 1 }}>
              <h2>Relationship Information</h2>
            </Box>
            <Divider />
            <Table
              borderAxis="bothBetween"
              stripe="odd"
              hoverRow
              sx={{
                '& tr > *:first-child': {
                  position: 'sticky',
                  left: 0,
                  boxShadow: '1px 0 var(--TableCell-borderColor)',
                  bgcolor: 'background.surface',
                },
                '& tr > *:last-child': {
                  position: 'sticky',
                  right: 0,
                  bgcolor: 'var(--TableCell-headBackground)',
                },
              }}
            >
              <thead>
                <tr>
                  <th style={{ width: '12.5rem' }}>Name</th>
                  <th style={{ width: '12.5rem' }}>Profile</th>
                  <th style={{ width: 'var(--Table-lastColumnWidth)' }} />
                </tr>
              </thead>
              <tbody>
                {user.relatedUsers.length > 0 ? (
                  user.relatedUsers.map((relatedUser) => (
                    <tr key={relatedUser.id}>
                      <td>{relatedUser.firstName}</td>
                      <td>{relatedUser.profile}</td>
                      <td>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button size="sm" variant="plain" color="neutral">
                            Edit
                          </Button>
                          <Button size="sm" variant="soft" color="danger">
                            Delete
                          </Button>
                        </Box>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', padding: '16px' }}>
                      No related users present
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
            <CardOverflow sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
              <CardActions sx={{ alignSelf: 'flex-end', pt: 2 }}>
                <Button size="sm" variant="outlined" color="neutral">
                  Cancel
                </Button>
                <Button size="sm" variant="solid">
                  Save
                </Button>
              </CardActions>
            </CardOverflow>
          </Card>


        </Layout.Main>
      </Layout.Root>
    </CssVarsProvider>
  );
}