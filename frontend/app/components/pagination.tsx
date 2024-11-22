import * as React from 'react';
import Box from '@mui/joy/Box';
import IconButton from '@mui/joy/IconButton';
import Typography from '@mui/joy/Typography';
import Skeleton from '@mui/joy/Skeleton';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                my: 2,
                p: 1,
                borderRadius: 'lg',
                bgcolor: 'background.surface',
                boxShadow: 'sm',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                    boxShadow: 'md',
                    transform: 'translateY(-2px)',
                },
            }}
        >
            <IconButton
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1}
                size="sm"
                variant="plain"
                color="neutral"
                sx={{ 
                    transition: 'all 0.2s',
                    '&:hover': { bgcolor: 'background.level1' },
                }}
            >
                <FirstPageIcon />
            </IconButton>
            <IconButton
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                size="sm"
                variant="plain"
                color="neutral"
                sx={{ 
                    transition: 'all 0.2s',
                    '&:hover': { bgcolor: 'background.level1' },
                }}
            >
                <NavigateBeforeIcon />
            </IconButton>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    px: 2,
                    py: 0.5,
                    borderRadius: 'pill',
                    bgcolor: 'background.level1',
                    minWidth: '80px',
                }}
            >
                <Typography level="body-sm" fontWeight="lg" color="primary">
                    {currentPage}
                </Typography>
                <Typography level="body-sm" sx={{ mx: 0.5 }} color="neutral">
                    /
                </Typography>
                <Typography level="body-sm" fontWeight="lg" color="neutral">
                    {totalPages}
                </Typography>
            </Box>
            <IconButton
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                size="sm"
                variant="plain"
                color="neutral"
                sx={{ 
                    transition: 'all 0.2s',
                    '&:hover': { bgcolor: 'background.level1' },
                }}
            >
                <NavigateNextIcon />
            </IconButton>
            <IconButton
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage === totalPages}
                size="sm"
                variant="plain"
                color="neutral"
                sx={{ 
                    transition: 'all 0.2s',
                    '&:hover': { bgcolor: 'background.level1' },
                }}
            >
                <LastPageIcon />
            </IconButton>
        </Box>
    );
};

export const PaginationSkeleton: React.FC = () => {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                my: 2,
                p: 1,
                borderRadius: 'lg',
                bgcolor: 'background.surface',
                boxShadow: 'sm',
            }}
        >
            <Skeleton variant="circular" width={32} height={32} />
            <Skeleton variant="circular" width={32} height={32} />
            <Skeleton 
                variant="rectangular" 
                width={80}
                height={32} 
                sx={{ 
                    borderRadius: 'pill',
                }} 
            />
            <Skeleton variant="circular" width={32} height={32} />
            <Skeleton variant="circular" width={32} height={32} />
        </Box>
    );
};

export default Pagination;