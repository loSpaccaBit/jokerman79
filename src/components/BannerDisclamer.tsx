import Image from "next/image";

export function BannerDisclamer() {
    return (
        <div className="bg-secondary flex items-center justify-center rounded-sm px-2 py-1 md:px-3 md:py-2">
            <div className="text-xs md:text-sm text-black dark:text-white flex items-center gap-2 md:gap-3 text-center leading-tight">
                <span className="hidden sm:inline">Attenzione il gioco provoca dipendenza patologica ed è vietato ai minori</span>
                <span className="sm:hidden">Il gioco provoca dipendenza ed è vietato ai minori</span>
                <div className="flex-shrink-0 relative">
                    <Image
                        src="/assets/gioco_responsabile.png"
                        alt="Gioco Responsabile - Logo certificazione"
                        width={32}
                        height={32}
                        className="w-8 h-8 md:w-12 md:h-12 object-contain"
                        priority
                    />
                </div>
            </div>
        </div>
    );
}
