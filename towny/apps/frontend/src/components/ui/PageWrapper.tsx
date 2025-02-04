import { FC, ReactNode } from 'react';

interface PageProps {
    children: ReactNode;
    className?: string;
}

const PageWrapper: FC<PageProps> = ({ children, className = '' }) => {
    return (
        <div className={`min-h-screen bg-white pb-10 pt-20 ${className}`}>
            {children}
        </div>
    );
};

export default PageWrapper;