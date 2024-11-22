'use client';

import * as React from 'react';
import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Button from '@mui/joy/Button';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import ListItemButton from '@mui/joy/ListItemButton';
import ListItemContent from '@mui/joy/ListItemContent';
import Checkbox from '@mui/joy/Checkbox';
import Sheet from '@mui/joy/Sheet';
import IconButton from '@mui/joy/IconButton';
import Divider from '@mui/joy/Divider';
import CircularProgress from '@mui/joy/CircularProgress';
import Alert from '@mui/joy/Alert';
import LinearProgress from '@mui/joy/LinearProgress';
import Input from '@mui/joy/Input';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import DialogTitle from '@mui/joy/DialogTitle';
import DialogContent from '@mui/joy/DialogContent';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Avatar from '@mui/joy/Avatar';
import Skeleton from '@mui/joy/Skeleton';
import Chip from '@mui/joy/Chip';
import Pagination from '@/app/components/pagination';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

import Layout from '@/app/components/layout';
import Header from '@/app/components/header';
import Navigation from '@/app/components/navigation';
import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface Group {
  id: number;
  name: string;
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
  data: Group[];
}

// Add this custom hook at the top of the file
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

export default function GroupPermissionsPage() {
  const [selectedGroup, setSelectedGroup] = React.useState<Group | null>(null);
  const [groups, setGroups] = React.useState<Group[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [permissionNodes, setPermissionNodes] = React.useState<Record<string, string[]>>({});
  const [searchQuery, setSearchQuery] = React.useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [isNewGroupModalOpen, setIsNewGroupModalOpen] = React.useState(false);
  const [newGroupName, setNewGroupName] = React.useState('');
  const [isPortalVisible, setIsPortalVisible] = React.useState(false);
  const [portalContainer, setPortalContainer] = React.useState<HTMLElement | null>(null);
  const [isEditGroupModalOpen, setIsEditGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [pagination, setPagination] = React.useState<ApiResponse['meta'] | null>(null);
  const [paginationPortal, setPaginationPortal] = React.useState<HTMLElement | null>(null);
  const [editingGroupId, setEditingGroupId] = useState<number | null>(null);
  const [editingGroupName, setEditingGroupName] = useState('');
  const [isCreatingNewGroup, setIsCreatingNewGroup] = useState(false);

  React.useEffect(() => {
    fetchGroups();
    fetchPermissionsData();

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

  const fetchGroups = useCallback((page = 1) => {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/groups?page=${page}&search=${debouncedSearchQuery}`, { credentials: 'include' })
      .then(response => response.json())
      .then((data: ApiResponse) => {
        setGroups(data.data);
        setPagination(data.meta);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch groups');
        setLoading(false);
        console.error(err);
      });
  }, [debouncedSearchQuery]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

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

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleCreateNewGroup = () => {
    if (newGroupName.trim()) {
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newGroupName }),
        credentials: 'include',
      })
        .then(response => response.json())
        .then(newGroup => {
          setGroups([...groups, newGroup]);
          setIsCreatingNewGroup(false);
          setNewGroupName('');
          // refresh group permissions
          fetchGroupData(newGroup.id);
        })
        .catch(err => {
          console.error('Failed to create new group', err);
          // Handle error (e.g., show an error message to the user)
        });
    }
  };

  const handleEditGroup = (group: Group) => {
    setEditingGroupId(group.id);
    setEditingGroupName(group.name);
  };

  const handleUpdateGroup = () => {
    if (editingGroupId && editingGroupName.trim()) {
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/groups/${editingGroupId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingGroupName }),
        credentials: 'include',
      })
        .then(response => response.json())
        .then(updatedGroup => {
          setGroups(groups.map(g => g.id === updatedGroup.id ? updatedGroup : g));
          setEditingGroupId(null);
          setEditingGroupName('');
        })
        .catch(err => {
          console.error('Failed to update group', err);
          // Handle error (e.g., show an error message to the user)
        });
    }
  };

  const handleDeleteGroup = (groupId: number) => {
    if (confirm('Are you sure you want to delete this group?')) {
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/groups/${groupId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
        .then(() => {
          setGroups(groups.filter(g => g.id !== groupId));
        })
        .catch(err => {
          console.error('Failed to delete group', err);
          // Handle error (e.g., show an error message to the user)
        });
    }
  };

  const fetchGroupData = (groupId: number) => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/groups/${groupId}`, { credentials: 'include' })
      .then(response => response.json())
      .then(updatedGroup => {
        setGroups(prevGroups => prevGroups.map(g => g.id === updatedGroup.id ? updatedGroup : g));
        setSelectedGroup(updatedGroup);
      })
      .catch(err => {
        console.error('Failed to refresh group data', err);
        setError('Failed to refresh group data');
      });
  };

  const handlePageChange = (page: number) => {
    fetchGroups(page);
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
              {!selectedGroup ? (
                <GroupListSection
                  groups={groups}
                  onSelectGroup={setSelectedGroup}
                  loading={loading}
                  error={error}
                  searchQuery={searchQuery}
                  onSearch={handleSearch}
                  onCreateNewGroup={() => setIsCreatingNewGroup(true)}
                  onEditGroup={handleEditGroup}
                  onDeleteGroup={handleDeleteGroup}
                  pagination={pagination}
                  onPageChange={handlePageChange}
                  paginationPortal={paginationPortal}
                  editingGroupId={editingGroupId}
                  setEditingGroupId={setEditingGroupId}
                  editingGroupName={editingGroupName}
                  setEditingGroupName={setEditingGroupName}
                  handleUpdateGroup={handleUpdateGroup}
                  isCreatingNewGroup={isCreatingNewGroup}
                  newGroupName={newGroupName}
                  setNewGroupName={setNewGroupName}
                  handleCreateNewGroup={handleCreateNewGroup}
                  setIsCreatingNewGroup={setIsCreatingNewGroup}
                />
              ) : (
                <GroupPermissions
                  group={selectedGroup}
                  onBack={() => setSelectedGroup(null)}
                  permissionNodes={permissionNodes}
                  setIsPortalVisible={setIsPortalVisible}
                  portalContainer={portalContainer}
                  refreshGroupData={fetchGroupData}
                />
              )}
            </Sheet>
          </Box>
        </Layout.Main>
      </Layout.Root>
      <Modal open={isNewGroupModalOpen} onClose={() => setIsNewGroupModalOpen(false)}>
        <ModalDialog>
          <DialogTitle>Create New Group</DialogTitle>
          <DialogContent>
            <FormControl>
              <FormLabel>Group Name</FormLabel>
              <Input
                autoFocus
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
              />
            </FormControl>
          </DialogContent>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', pt: 2 }}>
            <Button variant="plain" color="neutral" onClick={() => setIsNewGroupModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="solid" color="primary" onClick={handleCreateNewGroup}>
              Create
            </Button>
          </Box>
        </ModalDialog>
      </Modal>
      <Modal open={isEditGroupModalOpen} onClose={() => setIsEditGroupModalOpen(false)}>
        <ModalDialog>
          <DialogTitle>Edit Group</DialogTitle>
          <DialogContent>
            <FormControl>
              <FormLabel>Group Name</FormLabel>
              <Input
                autoFocus
                value={editingGroup?.name || ''}
                onChange={(e) => setEditingGroup(prev => prev ? { ...prev, name: e.target.value } : null)}
              />
            </FormControl>
          </DialogContent>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', pt: 2 }}>
            <Button variant="plain" color="neutral" onClick={() => setIsEditGroupModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="solid" color="primary" onClick={handleUpdateGroup}>
              Update
            </Button>
          </Box>
        </ModalDialog>
      </Modal>
    </CssVarsProvider>
  );
}

function GroupListSection({
  groups,
  onSelectGroup,
  loading,
  error,
  searchQuery,
  onSearch,
  onCreateNewGroup,
  onEditGroup,
  onDeleteGroup,
  pagination,
  onPageChange,
  paginationPortal,
  editingGroupId,
  setEditingGroupId,
  editingGroupName,
  setEditingGroupName,
  handleUpdateGroup,
  isCreatingNewGroup,
  newGroupName,
  setNewGroupName,
  handleCreateNewGroup,
  setIsCreatingNewGroup,
}: {
  groups: Group[],
  onSelectGroup: (group: Group) => void,
  loading: boolean,
  error: string | null,
  searchQuery: string,
  onSearch: (event: React.ChangeEvent<HTMLInputElement>) => void,
  onCreateNewGroup: () => void,
  onEditGroup: (group: Group) => void,
  onDeleteGroup: (groupId: number) => void,
  pagination: ApiResponse['meta'] | null,
  onPageChange: (page: number) => void,
  paginationPortal: HTMLElement | null,
  editingGroupId: number | null,
  setEditingGroupId: (id: number | null) => void,
  editingGroupName: string,
  setEditingGroupName: (name: string) => void,
  handleUpdateGroup: () => void,
  isCreatingNewGroup: boolean,
  newGroupName: string,
  setNewGroupName: (name: string) => void,
  handleCreateNewGroup: () => void,
  setIsCreatingNewGroup: (isCreating: boolean) => void,
}) {
  const handleNewGroupKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleCreateNewGroup();
    }
  };

  const handleEditGroupKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleUpdateGroup();
    }
  };

  return (
    <>
      <Typography level="h2" sx={{ mb: 2 }}>Group Permissions</Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Input
          startDecorator={<SearchIcon />}
          placeholder="Search groups..."
          value={searchQuery}
          onChange={onSearch}
          sx={{ flexGrow: 1 }}
        />
        <Button
          startDecorator={<AddIcon />}
          onClick={() => setIsCreatingNewGroup(true)}
          disabled={isCreatingNewGroup}
        >
          New Group
        </Button>
      </Box>
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
                        <Skeleton variant="circular" width={40} height={40} />
                        <Box>
                          <Skeleton variant="text" width={120} height={20} sx={{ mb: 1 }} />
                          <Skeleton variant="text" width={80} height={16} />
                        </Box>
                      </Box>
                    </ListItemContent>
                    <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 'sm' }} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </>
        ) : error ? (
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
        ) : (
          <>
            <List>
              {isCreatingNewGroup && (
                <ListItem>
                  <Input
                    autoFocus
                    placeholder="New group name"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    onKeyPress={handleNewGroupKeyPress}
                    endDecorator={
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton color="neutral" onClick={() => setIsCreatingNewGroup(false)}>
                          <CloseIcon />
                        </IconButton>
                        <IconButton color="primary" onClick={handleCreateNewGroup}>
                          <CheckIcon />
                        </IconButton>
                      </Box>
                    }
                    sx={{ flexGrow: 1 }}
                  />
                </ListItem>
              )}
              {groups.map((group) => (
                <ListItem key={group.id}>
                  {editingGroupId === group.id ? (
                    <Input
                      autoFocus
                      value={editingGroupName}
                      onChange={(e) => setEditingGroupName(e.target.value)}
                      onKeyPress={handleEditGroupKeyPress}
                      endDecorator={
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton color="neutral" onClick={() => setEditingGroupId(null)}>
                            <CloseIcon />
                          </IconButton>
                          <IconButton color="primary" onClick={handleUpdateGroup}>
                            <CheckIcon />
                          </IconButton>
                        </Box>
                      }
                      sx={{ flexGrow: 1 }}
                    />
                  ) : (
                    <ListItemButton
                      onClick={() => onSelectGroup(group)}
                      sx={{
                        borderRadius: 'sm',
                        transition: 'all 0.2s',
                        '&:hover': { bgcolor: 'background.level1' },
                        height: { xs: 'auto', md: '7vh' },
                      }}
                    >
                      <ListItemContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar>{group.name[0].toUpperCase()}</Avatar>
                          <Box>
                            <Typography level="title-md">{group.name}</Typography>
                            <Typography level="body-sm">
                              {group.permissions ? `${group.permissions.length} permissions` : '0 permissions'}
                            </Typography>
                          </Box>
                        </Box>
                      </ListItemContent>
                      <Chip color="primary" size="sm" variant="soft" sx={{ mr: 1 }}>Group</Chip>
                      <IconButton
                        variant="plain"
                        color="neutral"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditGroup(group);
                        }}
                        sx={{ transition: 'all 0.2s', '&:hover': { color: 'primary.main', transform: 'scale(1.1)' } }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        variant="plain"
                        color="danger"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteGroup(group.id);
                        }}
                        sx={{ transition: 'all 0.2s', '&:hover': { color: 'danger.main', transform: 'scale(1.1)' } }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemButton>
                  )}
                </ListItem>
              ))}
            </List>
            {groups.length === 0 && (
              <Typography level="body-lg" sx={{ textAlign: 'center', mt: 4, color: 'text.secondary' }}>
                No groups found
              </Typography>
            )}
          </>
        )}
      </Box>
      {pagination && pagination.lastPage > 1 && paginationPortal && createPortal(
        <Pagination
          totalPages={pagination.lastPage}
          currentPage={pagination.currentPage}
          onPageChange={onPageChange}
        />,
        paginationPortal
      )}
    </>
  );
}

function GroupPermissions({
  group,
  onBack,
  permissionNodes,
  setIsPortalVisible,
  portalContainer,
  refreshGroupData,
}: {
  group: Group,
  onBack: () => void,
  permissionNodes: Record<string, string[]>,
  setIsPortalVisible: (isVisible: boolean) => void,
  portalContainer: HTMLElement | null,
  refreshGroupData: (groupId: number) => void,
}) {
  const [expandedModels, setExpandedModels] = React.useState({} as Record<string, boolean>);
  const [groupPermissions, setGroupPermissions] = React.useState<string[]>(group.permissions);
  const [saveStatus, setSaveStatus] = React.useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  React.useEffect(() => {
    setIsPortalVisible(true);
    return () => setIsPortalVisible(false);
  }, [setIsPortalVisible]);

  const toggleExpand = (model: string) => {
    setExpandedModels(prev => ({ ...prev, [model]: !prev[model] }));
  };

  const handlePermissionChange = (node: string, action: string) => {
    const permissionString = `${node}.${action}`;
    setGroupPermissions(prev => {
      if (prev.includes(permissionString)) {
        return prev.filter(p => p !== permissionString);
      } else {
        return [...prev, permissionString];
      }
    });
  };

  const saveChanges = () => {
    setSaveStatus('saving');
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/groups/${group.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ permissions: groupPermissions }),
      credentials: 'include',
    })
      .then(response => {
        if (!response.ok) throw new Error('Failed to save permissions');
        setSaveStatus('success');
        refreshGroupData(group.id); // Refresh the group data after successful save
      })
      .catch(err => {
        console.error(err);
        setSaveStatus('error');
      });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: '2vh' }}>
        <IconButton onClick={onBack} variant="outlined" color="neutral">
          <ArrowBackIcon />
        </IconButton>
        <Typography level="h2">Permissions for {group.name}</Typography>
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
                    {node.map((action) => (
                      <ListItem key={action}>
                        <Checkbox
                          label={action}
                          checked={groupPermissions.includes(`${nodeName}.${action}`)}
                          onChange={() => handlePermissionChange(nodeName, action)}
                          sx={{
                            textTransform: 'capitalize',
                            transition: 'all 0.2s',
                            '&:hover': { transform: 'scale(1.05)' },
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </ListItem>
              )}
              {index < Object.keys(permissionNodes).length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Box>
      {portalContainer && createPortal(
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
            onClick={() => setGroupPermissions([])}
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
              ? 'Group permissions saved successfully.'
              : 'Failed to save group permissions. Please try again.'}
          </Typography>
        </Alert>,
        document.body
      )}
    </Box>
  );
}
