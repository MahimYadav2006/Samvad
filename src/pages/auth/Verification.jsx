import { Link } from "react-router-dom";
import Logo from "../../components/Logo";
function Verification(){
    return (
        <div className="overflow-hidden px-4 dark:bg-boxdark-2 sm:px-8">
            <div className="flex h-screen flex-col items-center justify-center overflow-hidden">
                <div className="no-scrollbar overflow-y-auto py-20">
                    <div className="mx-auto w-full max-w-[480px]">
                        <div className="text-center">
                            <Link to="/">
                                <Logo></Logo>
                            </Link>

                            <div className="bg-white p-4 shadow-14 rounded-xl dark:bg-boxdark lg:p-7.5 xl:p-12.5">

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Verification;