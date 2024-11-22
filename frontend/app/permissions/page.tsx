'use client';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Button from '@mui/joy/Button';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import ListItemButton from '@mui/joy/ListItemButton';
import ListItemContent from '@mui/joy/ListItemContent';
import Avatar from '@mui/joy/Avatar';
import Chip from '@mui/joy/Chip';
import Checkbox from '@mui/joy/Checkbox';
import Sheet from '@mui/joy/Sheet';
import IconButton from '@mui/joy/IconButton';
import Divider from '@mui/joy/Divider';
import CircularProgress from '@mui/joy/CircularProgress';
import Alert from '@mui/joy/Alert';
import Skeleton from '@mui/joy/Skeleton';
import LinearProgress from '@mui/joy/LinearProgress';
import Input from '@mui/joy/Input';
import SearchIcon from '@mui/icons-material/Search';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import EditIcon from '@mui/icons-material/Edit';

import Layout from '@/app/components/layout';
import Header from '@/app/components/header';
import Navigation from '@/app/components/navigation';
import Pagination from '@/app/components/pagination';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface User {
  id: number;
  firstName: string;
  lastName: string | null;
  email: string;
  profile: string;
  permissions: string[];
}

interface ApiResponse {
  meta: {
    total: number;
    perPage: number;
    currentPage: number;
    lastPage: number;
    firstPage: number;
    firstPageUrl: string;
    lastPageUrl: string;
    nextPageUrl: string | null;
    previousPageUrl: string | null;
  };
  data: User[];
}

export default function PermissionsPage() {
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [pagination, setPagination] = React.useState<ApiResponse['meta'] | null>(null);
  const [permissionNodes, setPermissionNodes] = React.useState<Record<string, string[]>>({});
  const [isPortalVisible, setIsPortalVisible] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [paginationPortal, setPaginationPortal] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    fetchData(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users?search=${debouncedSearchQuery}`, setUsers, setPagination);
  }, [debouncedSearchQuery]);

  React.useEffect(() => {
    fetchPermissionsData();
  }, []);

  React.useEffect(() => {
    // Create a portal container for the pagination
    const portalContainer = document.createElement('div');
    portalContainer.style.position = 'absolute';
    portalContainer.style.bottom = '-5px'; // Adjust this value to move pagination up or down
    portalContainer.style.left = '0';
    portalContainer.style.right = '0';
    portalContainer.style.display = 'flex';
    portalContainer.style.justifyContent = 'center';
    portalContainer.style.zIndex = '1000';
    setPaginationPortal(portalContainer);

    return () => {
      if (portalContainer.parentNode) {
        portalContainer.parentNode.removeChild(portalContainer);
      }
    };
  }, []);

  const fetchData = (url: string, setData: React.Dispatch<React.SetStateAction<any>>, setMeta?: React.Dispatch<React.SetStateAction<any>>) => {
    setLoading(true);
    fetch(url, { credentials: 'include' })
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch data');
        return response.json();
      })
      .then((data: ApiResponse) => {
        setData(data.data);
        if (setMeta) setMeta(data.meta);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  const fetchPermissionsData = () => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/permissions/nodes`, { credentials: 'include' })
      .then(response => response.json())
      .then(nodes => {
        setPermissionNodes(nodes);
      })
      .catch(err => {
        setError('Failed to fetch permission data');
        console.error(err);
      });
  };

  const handlePageChange = (page: number) => {
    fetchData(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users?page=${page}&search=${searchQuery}`, setUsers, setPagination);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  return (
    <CssVarsProvider disableTransitionOnChange>
      <CssBaseline />
      <Layout.Root sx={{ height: '100vh', overflow: 'hidden' }}>
        <Navigation />
        <Header />
        <Layout.Main sx={{ height: '100vh', overflow: 'hidden', position: 'relative' }}>
          <Box sx={{ p: '2vh', height: '100%', boxSizing: 'border-box', position: 'relative' }}>
            <Sheet
              sx={{
                borderRadius: 'lg',
                p: '2vh',
                boxShadow: 'sm',
                transition: 'all 0.2s ease-in-out',
                '&:hover': { boxShadow: 'md' },
                height: isPortalVisible ? 'calc(100% - 8vh)' : '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden',
              }}
              ref={(el) => {
                if (el && paginationPortal) {
                  el.appendChild(paginationPortal);
                }
              }}
            >
              {!selectedUser ? (
                <UserListSection
                  users={users}
                  onSelectUser={setSelectedUser}
                  pagination={pagination}
                  onPageChange={handlePageChange}
                  searchQuery={searchQuery}
                  onSearch={handleSearch}
                  loading={loading}
                  error={error}
                  paginationPortal={paginationPortal}
                />
              ) : (
                <UserPermissions
                  user={selectedUser}
                  onBack={() => setSelectedUser(null)}
                  permissionNodes={permissionNodes}
                  setIsPortalVisible={setIsPortalVisible}
                />
              )}
            </Sheet>
          </Box>
        </Layout.Main>
      </Layout.Root>
    </CssVarsProvider>
  );
}

function UserListSection({
  users,
  onSelectUser,
  pagination,
  onPageChange,
  searchQuery,
  onSearch,
  loading,
  error,
  paginationPortal
}: {
  users: User[],
  onSelectUser: (user: User) => void,
  pagination: ApiResponse['meta'] | null,
  onPageChange: (page: number) => void,
  searchQuery: string,
  onSearch: (event: React.ChangeEvent<HTMLInputElement>) => void,
  loading: boolean,
  error: string | null,
  paginationPortal: HTMLElement | null
}) {
  return (
    <>
      <Typography level="h2" sx={{ mb: 2 }}>User Permissions</Typography>
      <Input
        startDecorator={<SearchIcon />}
        placeholder="Search users..."
        value={searchQuery}
        onChange={onSearch}
        sx={{ mb: 2, width: '100%' }}
      />
      <Box sx={{ flexGrow: 1, overflow: 'auto', position: 'relative' }}>
        {loading ? (
          <>
            <LinearProgress sx={{ mb: 2 }} />
            <List>
              {[...Array(10)].map((_, index) => (
                <ListItem key={index}>
                  <ListItemButton disabled
                    sx={{
                      height: { xs: 'auto', md: '7vh' },
                    }}
                  >
                    <ListItemContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Skeleton variant="circular" width={40} height={40} animation="wave" />
                        <Box>
                          <Skeleton variant="text" width={120} height={20} animation="wave" sx={{ mb: 1 }} />
                          <Skeleton variant="text" width={180} height={16} animation="wave" />
                        </Box>
                      </Box>
                    </ListItemContent>
                    <Skeleton variant="rectangular" width={60} height={24} animation="wave" sx={{ borderRadius: 'sm' }} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </>
        ) : error ? (
          <Typography color="danger">{error}</Typography>
        ) : (
          <UserList users={users} onSelectUser={onSelectUser} />
        )}
      </Box>
      {pagination && pagination.lastPage > 1 && paginationPortal && ReactDOM.createPortal(
        <Pagination
          currentPage={pagination?.currentPage || 1}
          totalPages={pagination?.lastPage || 1}
          onPageChange={onPageChange}
        />,
        paginationPortal
      )}
    </>
  );
}

function UserList({ users, onSelectUser }: { users: User[], onSelectUser: (user: User) => void }) {
  return (
    <List>
      {users.map((user) => (
        <ListItem key={user.id}>
          <ListItemButton
            onClick={() => onSelectUser(user)}
            sx={{
              borderRadius: 'sm',
              transition: 'all 0.2s',
              '&:hover': { bgcolor: 'background.level1' },
              height: { xs: 'auto', md: '7vh' },
            }}
          >
            <ListItemContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar>{user.firstName[0]}</Avatar>
                <Box>
                  <Typography level="title-md">{`${user.firstName} ${user.lastName || ''}`}</Typography>
                  <Typography level="body-sm">{user.email}</Typography>
                </Box>
              </Box>
            </ListItemContent>
            <Chip color="primary" size="sm" variant="soft" sx={{ mr: 1 }}>{user.profile}</Chip>
            <IconButton variant="plain" color="neutral" size="sm" sx={{ transition: 'all 0.2s', '&:hover': { color: 'primary.main', transform: 'scale(1.1)' } }}>
              <EditIcon />
            </IconButton>
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
}

function UserPermissions({
  user,
  onBack,
  permissionNodes,
  setIsPortalVisible
}: {
  user: User,
  onBack: () => void,
  permissionNodes: Record<string, string[]>,
  setIsPortalVisible: (isVisible: boolean) => void
}) {
  const [expandedModels, setExpandedModels] = React.useState({} as Record<string, boolean>);
  const [userPermissions, setUserPermissions] = React.useState<string[]>([]);
  const [groupPermissions, setGroupPermissions] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [saveStatus, setSaveStatus] = React.useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [portalContainer, setPortalContainer] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    fetchUserPermissions();
    fetchGroupPermissions();
  }, [user.id, user.profile]);

  React.useEffect(() => {
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.zIndex = '10000';
    container.style.bottom = '0';
    container.style.left = '0';
    container.style.right = '0';
    document.body.appendChild(container);
    setPortalContainer(container);

    return () => {
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
    };
  }, []);

  React.useEffect(() => {
    setIsPortalVisible(true);
    return () => setIsPortalVisible(false);
  }, [setIsPortalVisible]);

  const fetchUserPermissions = () => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${user.id}/permissions`, { credentials: 'include' })
      .then(response => response.json())
      .then(permissions => {
        setUserPermissions(permissions);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch user permissions');
        setLoading(false);
        console.error(err);
      });
  };

  const fetchGroupPermissions = () => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/permissions/group?profile=${user.profile}`, { credentials: 'include' })
      .then(response => response.json())
      .then(groupPermissions => {
        setGroupPermissions(groupPermissions);
      })
      .catch(err => {
        console.error('Failed to fetch group permissions', err);
      });
  };

  const toggleExpand = (model: string) => {
    setExpandedModels(prev => ({ ...prev, [model]: !prev[model] }));
  };

  const getPermissionState = (node: string, action: string): boolean | 'indeterminate' | null => {
    const permissionString = `${node}.${action}`;
    const userPermission = userPermissions.find(p => p.endsWith(permissionString));
    const groupPermission = groupPermissions.includes(permissionString);

    if (userPermission) {
      if (userPermission.startsWith('+')) return true;
      if (userPermission.startsWith('-')) return false;
    }

    if (groupPermission) return 'indeterminate';

    return null;
  };

  const handlePermissionChange = (node: string, action: string) => {
    const permissionString = `${node}.${action}`;
    const currentState = getPermissionState(node, action);

    setUserPermissions(prev => {
      const newPermissions = prev.filter(p => !p.endsWith(permissionString));

      switch (currentState) {
        case true:
          // If it's in group permissions, remove the override to restore group permission
          if (groupPermissions.includes(permissionString)) {
            // Don't add anything, effectively restoring to group permission
          } else {
            // If it's not in group permissions, we don't need to add a negative permission
            // because the permission is already not granted
          }
          break;
        case false:
          newPermissions.push(`+${permissionString}`);
          break;
        case 'indeterminate':
          newPermissions.push(`-${permissionString}`);
          break;
        case null:
          newPermissions.push(`+${permissionString}`);
          break;
      }

      return newPermissions;
    });
  };

  const saveChanges = () => {
    setSaveStatus('saving');
    // Only send user-specific permissions (those with + or - prefix)
    const userSpecificPermissions = userPermissions.filter(perm => perm.startsWith('+') || perm.startsWith('-'));
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${user.id}/permissions`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ permissions: userSpecificPermissions }),
      credentials: 'include',
    })
      .then(response => {
        if (!response.ok) throw new Error('Failed to save permissions');
        setSaveStatus('success');
      })
      .catch(err => {
        console.error(err);
        setSaveStatus('error');
      });
  };

  if (loading) return <CircularProgress />;
  if (error) return (
    <Alert
      color="danger"
      variant="soft"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        fontSize: 'lg',
        fontWeight: 'bold',
      }}
    >
      {error}
    </Alert>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: '2vh' }}>
        <IconButton onClick={onBack} variant="outlined" color="neutral">
          <ArrowBackIcon />
        </IconButton>
        <Typography level="h2">Permissions for {`${user.firstName} ${user.lastName || ''}`}</Typography>
      </Box>
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <List>
          {Object.entries(permissionNodes).map(([nodeName, node], index) => (
            <React.Fragment key={nodeName}>
              <ListItem
                sx={{
                  bgcolor: expandedModels[nodeName] ? 'background.level1' : 'transparent',
                  borderRadius: 'sm',
                  transition: 'all 0.2s',
                }}
                endAction={
                  <IconButton
                    onClick={() => toggleExpand(nodeName)}
                    sx={{ transition: 'all 0.2s', '&:hover': { transform: 'scale(1.1)' } }}
                  >
                    {expandedModels[nodeName] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                }
              >
                <ListItemButton onClick={() => toggleExpand(nodeName)} sx={{ py: 2 }}>
                  <ListItemContent>
                    <Typography level="title-lg">{nodeName} Permissions</Typography>
                  </ListItemContent>
                </ListItemButton>
              </ListItem>
              {expandedModels[nodeName] && (
                <ListItem nested sx={{ my: 1, pl: 4 }}>
                  <List sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2 }}>
                    {node.map((action: string) => {
                      const permissionState = getPermissionState(nodeName, action);

                      return (
                        <ListItem key={action}>
                          <Checkbox
                            label={action}
                            checked={permissionState === true}
                            indeterminate={permissionState === 'indeterminate'}
                            onChange={() => handlePermissionChange(nodeName, action)}
                            sx={{
                              textTransform: 'capitalize',
                              transition: 'all 0.2s',
                              '&:hover': { transform: 'scale(1.05)' },
                              '& .MuiCheckbox-root': {
                                color: permissionState === null ? 'text.disabled' : 'inherit',
                              },
                            }}
                          />
                        </ListItem>
                      );
                    })}
                  </List>
                </ListItem>
              )}
              {index < Object.keys(permissionNodes).length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Box>
      {portalContainer && ReactDOM.createPortal(
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            p: '2vh',
            bgcolor: 'background.body',
            borderTop: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '2vw',
            boxShadow: '0px -2px 10px rgba(0,0,0,0.1)',
          }}
        >
          <Button
            variant="outlined"
            color="neutral"
            size="lg"
            onClick={() => setUserPermissions([])}
            sx={{ transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)' } }}
          >
            Reset All
          </Button>
          <Button
            variant="solid"
            color="primary"
            size="lg"
            onClick={saveChanges}
            disabled={saveStatus === 'saving'}
            sx={{ transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)' } }}
          >
            {saveStatus === 'saving' ? (
              <CircularProgress size="sm" color="neutral" sx={{ mr: 1 }} />
            ) : null}
            {saveStatus === 'saving' ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>,
        portalContainer
      )}
      {(saveStatus === 'success' || saveStatus === 'error') && createPortal(
        <Alert
          color={saveStatus === 'success' ? 'success' : 'danger'}
          variant="soft"
          sx={{
            position: 'fixed',
            bottom: '10vh',
            left: '50%',
            transform: 'translateX(-50%)',
            maxWidth: '90vw',
            width: '40vw',
            boxShadow: 'md',
            animation: 'fadeIn 0.3s ease-out',
            '@keyframes fadeIn': {
              from: { opacity: 0, transform: 'translate(-50%, 20px)' },
              to: { opacity: 1, transform: 'translate(-50%, 0)' },
            },
          }}
        >
          <Typography level="body-md" fontWeight="bold">
            {saveStatus === 'success' ? 'Success!' : 'Error'}
          </Typography>
          <Typography level="body-sm">
            {saveStatus === 'success'
              ? 'Permissions saved successfully.'
              : 'Failed to save permissions. Please try again.'}
          </Typography>
        </Alert>,
        document.body
      )}
    </Box>
  );
}