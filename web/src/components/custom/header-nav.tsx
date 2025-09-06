import { cn } from "@/lib/utils.ts"
import {Link, useLocation} from "react-router-dom";

interface HeaderNavProps extends React.HTMLAttributes<HTMLElement> {
    items: {
        href: string
        title: string
    }[]
}

const HeaderNav = ({ className, items, ...props }: HeaderNavProps) => {

    const location = useLocation();
    let pathname = location.pathname;

    return (
        <nav
            className={cn(
                "flex items-center space-x-4 lg:space-x-6",
                className
            )}
            {...props}
        >
            {items.map((item) => (
                <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                        pathname === item.href
                            ? ""
                            : "text-muted-foreground",
                        "text-sm font-medium transition-colors hover:text-primary"
                    )}
                >
                    {item.title}
                </Link>
            ))}
        </nav>
    );
};

export default HeaderNav;