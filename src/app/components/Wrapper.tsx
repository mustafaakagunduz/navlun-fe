import React from "react";

const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="mx-auto px-4 md:px-6 max-w-7xl">
            {children}
        </div>
    )
}

export default Wrapper;
