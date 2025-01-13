import { FC, ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
}

const Section: FC<CardProps> = ({ children, className = '' }) => {
    return (
        <div className={`mx-auto max-w-[1440px] px-3 md:px-4 lg:px-5 xl:px-[100px] py-4 lg:py-5 xl:py-7 ${className}`}>
            {children}
        </div>
    );
};

export default Section;