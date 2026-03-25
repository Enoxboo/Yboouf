import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import RecipeCard from './RecipeCard';
import { useRef } from 'react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const PopularRecipesCarousel = ({ recipes }) => {
    const swiperRef = useRef(null);

    return (
        <div className="mb-12 relative px-4 sm:px-6 md:px-8 lg:px-12">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Découvrez nos recettes</h2>
            <Swiper
                modules={[Navigation, Pagination]}
                spaceBetween={24}
                slidesPerView={3}
                pagination={{ clickable: true }}
                loop={true}
                onSwiper={(swiper) => {
                    swiperRef.current = swiper;
                }}
                breakpoints={{
                    320: {
                        slidesPerView: 1,
                        spaceBetween: 12
                    },
                    640: {
                        slidesPerView: 2,
                        spaceBetween: 16
                    },
                    768: {
                        slidesPerView: 2,
                        spaceBetween: 20
                    },
                    1024: {
                        slidesPerView: 3,
                        spaceBetween: 24
                    }
                }}
                className="popular-carousel"
            >
                {recipes.map((recipe) => (
                    <SwiperSlide key={recipe.id}>
                        <RecipeCard recipe={recipe} />
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* Flèches personnalisées - responsives */}
            <button
                onClick={() => swiperRef.current?.slidePrev()}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-[#fac51d] hover:text-white transition text-lg sm:text-xl md:text-2xl font-bold"
                style={{color: '#095d63'}}
                aria-label="Diapositive précédente"
            >
                ←
            </button>
            <button
                onClick={() => swiperRef.current?.slideNext()}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-[#fac51d] hover:text-white transition text-lg sm:text-xl md:text-2xl font-bold"
                style={{color: '#095d63'}}
                aria-label="Diapositive suivante"
            >
                →
            </button>
        </div>
    );
};

export default PopularRecipesCarousel;
