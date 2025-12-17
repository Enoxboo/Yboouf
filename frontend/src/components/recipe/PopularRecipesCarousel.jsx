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
        <div className="mb-12 relative px-16">
            <h2 className="text-2xl font-bold mb-6">Découvrez nos recettes</h2>
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

            {/* Flèches personnalisées qui fonctionnent */}
            <button
                onClick={() => swiperRef.current?.slidePrev()}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-[#fac51d] hover:text-white transition text-2xl font-bold"
                style={{color: '#095d63'}}
            >
                ←
            </button>
            <button
                onClick={() => swiperRef.current?.slideNext()}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-[#fac51d] hover:text-white transition text-2xl font-bold"
                style={{color: '#095d63'}}
            >
                →
            </button>
        </div>
    );
};

export default PopularRecipesCarousel;
