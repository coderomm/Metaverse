import type { FC, ReactNode } from 'react';

interface SectionProps {
    children: ReactNode;
    className?: string;
}

const Section: FC<SectionProps> = ({ children, className = '' }) => {
    return (
        <section className={`mx-auto max-w-[1440px] px-3 sm:px-8 md:px-12 xl:px-[100px] py-4 lg:py-5 xl:py-7 ${className}`}>
            {children}
        </section>
    );
};

export default Section;