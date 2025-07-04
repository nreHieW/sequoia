import { FoodRecord } from '@/lib/types'



const FoodItemCard = ({ foodRecord }: { foodRecord: FoodRecord | null }) => {
    if (!foodRecord) return null;
    const totalCalories = foodRecord.total_calories;
    const parts = foodRecord.parts;
    
    return (
        <div className="space-y-4">
          {/* Total Calories Summary */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-green-800">Total Calories</h3>
              <span className="text-2xl font-bold text-green-600">{totalCalories}</span>
            </div>
          </div>
  
          {/* Food Items */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-700">Food Items Detected</h4>
            {parts.map((part) => (
              <div key={part.name} className="border border-gray-200 rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-medium text-gray-900">{part.name}</h5>
                  <span className="font-semibold text-gray-700">{part.calories} cal</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                  <div className="flex flex-col items-center">
                    <span className="text-gray-500">Protein</span>
                    <span className="font-medium text-gray-900">{part.protein}g</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-gray-500">Fat</span>
                    <span className="font-medium text-gray-900">{part.fat}g</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-gray-500">Carbs</span>
                    <span className="font-medium text-gray-900">{part.carbs}g</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
  
          
        </div>
    );
  };
  

export default FoodItemCard