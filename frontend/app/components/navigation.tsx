import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import SupportRoundedIcon from '@mui/icons-material/SupportRounded';
import LogoutIcon from '@mui/icons-material/Logout';
import Avatar from '@mui/joy/Avatar';
import Box from '@mui/joy/Box';
import Divider from '@mui/joy/Divider';
import GlobalStyles from '@mui/joy/GlobalStyles';
import IconButton from '@mui/joy/IconButton';
import Input from '@mui/joy/Input';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import ListItemButton, { listItemButtonClasses } from '@mui/joy/ListItemButton';
import ListItemContent from '@mui/joy/ListItemContent';
import Sheet from '@mui/joy/Sheet';
import Typography from '@mui/joy/Typography';
import * as React from 'react';

import { CalendarMonthRounded, MoodRounded, NewspaperRounded, SchoolRounded, SupervisedUserCircleRounded } from '@mui/icons-material';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import ColorSchemeToggle from './ColorSchemeToggle';
import { closeSidebar } from './utils';

const SignOutButton = () => {
    const handleSignOut = () => {
        // Clear token or perform any sign out logic
        localStorage.removeItem('token');

        // Redirect to the sign-in page using window.location
        window.location.href = '/signin';
    };

    return (
        <ListItemButton onClick={handleSignOut}>
            <LogoutIcon />
            Sign out
        </ListItemButton>
    );
};

function Toggler({
    defaultExpanded = false,
    renderToggle,
    children,
    defaultOpen = false
}: {
    defaultExpanded?: boolean;
    children: React.ReactNode;
    renderToggle: (params: {
        open: boolean;
        setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    }) => React.ReactNode;
    defaultOpen?: boolean;
}) {
    const [open, setOpen] = React.useState(defaultOpen || defaultExpanded);
    return (
        <React.Fragment>
            {renderToggle({ open, setOpen })}
            <Box
                sx={[
                    {
                        display: 'grid',
                        transition: '0.2s ease',
                        '& > *': {
                            overflow: 'hidden',
                        },
                    },
                    open ? { gridTemplateRows: '1fr' } : { gridTemplateRows: '0fr' },
                ]}
            >
                {children}
            </Box>
        </React.Fragment>
    );
}

export default function Sidebar() {
    const pathname = usePathname();
    return (
        <Sheet
            className="Sidebar"
            sx={{
                position: { xs: 'fixed', md: 'sticky' },
                transform: {
                    xs: 'translateX(calc(100% * (var(--SideNavigation-slideIn, 0) - 1)))',
                    md: 'none',
                },
                transition: 'transform 0.4s, width 0.4s',
                zIndex: 10000,
                height: '100dvh',
                width: 'var(--Sidebar-width)',
                top: 0,
                p: 2,
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                borderRight: '1px solid',
                borderColor: 'divider',
            }}
        >
            <GlobalStyles
                styles={(theme) => ({
                    ':root': {
                        '--Sidebar-width': '220px',
                        [theme.breakpoints.up('lg')]: {
                            '--Sidebar-width': '240px',
                        },
                    },
                })}
            />
            <Box
                className="Sidebar-overlay"
                sx={{
                    position: 'fixed',
                    zIndex: 9998,
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    opacity: 'var(--SideNavigation-slideIn)',
                    backgroundColor: 'var(--joy-palette-background-backdrop)',
                    transition: 'opacity 0.4s',
                    transform: {
                        xs: 'translateX(calc(100% * (var(--SideNavigation-slideIn, 0) - 1) + var(--SideNavigation-slideIn, 0) * var(--Sidebar-width, 0px)))',
                        lg: 'translateX(-100%)',
                    },
                }}
                onClick={() => closeSidebar()}
            />
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <IconButton size="sm">
                    <img
                        src="/logo_oic.png"
                        alt="Language"
                        className="w-10 h-12"
                    />
                </IconButton>
                <Typography level="title-lg">OIC Education</Typography>
            </Box>
            <Input size="sm" startDecorator={<SearchRoundedIcon />} placeholder="Search" />
            <Box
                sx={{
                    minHeight: 0,
                    overflow: 'hidden auto',
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    [`& .${listItemButtonClasses.root}`]: {
                        gap: 1.5,
                    },
                }}
            >
                <List
                    size="sm"
                    sx={{
                        gap: 1,
                        '--List-nestedInsetStart': '30px',
                        '--ListItem-radius': (theme) => theme.vars.radius.sm,
                    }}
                >
                    <ListItem>
                        <ListItemButton component={Link} href="/homepage" selected={pathname === '/homepage'}>
                            <HomeRoundedIcon />
                            <ListItemContent>
                                <Typography level="title-sm">Home</Typography>
                            </ListItemContent>
                        </ListItemButton>
                    </ListItem>
                    <ListItem>
                        <ListItemButton component={Link} href="/school" selected={pathname === '/school'}>
                            <SchoolRounded />
                            <ListItemContent>
                                <Typography level="title-sm">Schools</Typography>
                            </ListItemContent>
                        </ListItemButton>
                    </ListItem>
                    <ListItem>
                        <ListItemButton component={Link} href="/surveymanagement" selected={pathname === '/surveymanagement'}>
                            <AssignmentRoundedIcon />
                            <ListItemContent>
                                <Typography level="title-sm">Surveys</Typography>
                            </ListItemContent>
                        </ListItemButton>
                    </ListItem>
                    <ListItem>
                        <ListItemButton component={Link} href="/news_notifications" selected={pathname === '/news_notifications'}>
                            <NewspaperRounded />
                            <ListItemContent>
                                <Typography level="title-sm">News Notifications</Typography>
                            </ListItemContent>
                        </ListItemButton>
                    </ListItem>
                    <ListItem>
                        <ListItemButton component={Link} href="/calendar" selected={pathname === '/calendar'}>
                            <CalendarMonthRounded />
                            <ListItemContent>
                                <Typography level="title-sm">Calender</Typography>
                            </ListItemContent>
                        </ListItemButton>
                    </ListItem>
                    <ListItem>
                        <ListItemButton component={Link} href="/Daily_mood" selected={pathname === '/Daily_mood'}>
                            <MoodRounded />
                            <ListItemContent>
                                <Typography level="title-sm">Daily Mood</Typography>
                            </ListItemContent>
                        </ListItemButton>
                    </ListItem>
                    <Divider />
                    <ListItem nested>
                        <Toggler
                            defaultOpen={pathname === '/usermanagement' || pathname === '/permissions'}
                            renderToggle={({ open, setOpen }) => (
                                <ListItemButton onClick={() => setOpen(!open)}>
                                    <GroupRoundedIcon />
                                    <ListItemContent>
                                        <Typography level="title-sm">Users</Typography>
                                    </ListItemContent>
                                    <KeyboardArrowDownIcon
                                        sx={{ transform: open ? 'rotate(180deg)' : 'none' }}
                                    />
                                </ListItemButton>
                            )}
                        >
                            <List sx={{ gap: 0.5 }}>
                                <ListItem sx={{ mt: 0.5 }}>
                                    <ListItemButton
                                        role="menuitem"
                                        component={Link}
                                        href="/usermanagement"
                                        selected={pathname === '/usermanagement'}
                                    >
                                        All users
                                    </ListItemButton>
                                </ListItem>
                                <ListItem>
                                    <ListItemButton
                                        role="menuitem"
                                        component={Link}
                                        href="/permissions"
                                        selected={pathname === '/permissions'}
                                    >
                                        Permissions
                                    </ListItemButton>
                                </ListItem>
                            </List>
                        </Toggler>
                    </ListItem>
                    <ListItem>
                        <ListItemButton component={Link} href="/groups" selected={pathname === '/groups'}>
                            <SupervisedUserCircleRounded />
                            <ListItemContent>
                                <Typography level="title-sm">Groups</Typography>
                            </ListItemContent>
                        </ListItemButton>
                    </ListItem>
                </List>
                <List
                    size="sm"
                    sx={{
                        mt: 'auto',
                        flexGrow: 0,
                        '--ListItem-radius': (theme) => theme.vars.radius.sm,
                        '--List-gap': '8px',
                        mb: 2,
                    }}
                >
                    <ListItem>
                        <SignOutButton />
                    </ListItem>
                </List>
            </Box>
            <Divider />
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Avatar
                    variant="outlined"
                    size="sm"
                    src="/logo_oic.png"
                />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography level="title-sm">Demo User</Typography>
                    <Typography level="body-xs">demo@test.com</Typography>
                </Box>
                <ColorSchemeToggle sx={{ ml: 'auto' }} />
            </Box>
        </Sheet>
    );
}
