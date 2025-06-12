export const ErrorPage = () => {
    return (
        <>
            <div className="fixed bg-gray-50 flex h-dvh w-full items-center justify-center p-[16px] z-10 pointer-events-auto">
                <div className="flex flex-col justify-center items-center max-w-[600px]">
                    <div className="">
                        <img src="https://zep.us/images/error_500.png" alt="" className="h-[150px]" />
                    </div>
                    <div className="flex flex-col items-center mt-[40px] gap-[16px] justify-center">
                        <div className="text-gray-700 font-extrabold text-h3 whitespace-pre-line text-balance text-center">
                            An error occurred while accessing the Space.</div>
                        <p className="text-gray-600 whitespace-pre-line text-pretty text-body-1 text-center">
                            Please try again.
                            If the issue persists, please contact us via the Customer Support page.
                        </p>
                    </div>
                    <div className="mt-[24px] flex gap-[10px] items-center">
                        <a className="Button_btn__x5QQB Button_variant_secondary__GR1Id Button_size_lg__g_iwH"
                            href="https://zep-us.channel.io/support-bots/86325">
                            <span>Customer Support</span>
                        </a>
                        <a className="Button_btn__x5QQB Button_variant_primary__mo0N_ Button_size_lg__g_iwH" href="/">
                            <span>Go Home</span>
                        </a>
                    </div>
                </div>
                <img width="57" height="20" className="absolute bottom-[40px]" src="/images/light/layout/logo_zep.svg" alt="zep" data-sentry-source-file="ErrorPageWrapper.tsx" />
            </div>
        </>
    )
}