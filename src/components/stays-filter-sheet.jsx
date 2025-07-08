import * as Dialog from '@radix-ui/react-dialog';
import { ChevronDown, SlidersHorizontal, X} from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";


export default function StaysFilterSheet() {

    return (
        function FilterSheet() {
            const [open, setOpen] = useState(false)
            const [priceRange, setPriceRange] = useState([84, 8411])
            const [showMoreActivity, setShowMoreActivity] = useState(false)
            const [showMoreLanguage, setShowMoreLanguage] = useState(false)
          
            return (
              <Dialog.Root open={open} onOpenChange={setOpen}>
                {/* <Dialog.Trigger asChild> */}
                  <button className="h-14  px-8 border-2 ring-1 ring-brightGreen bg-gray-50 text-[#4E7B39] rounded-full hover:bg-primaryGreen hover:text-white transition-colors duration-300 text-sm font-medium flex items-center justify-center gap-2">
                    <SlidersHorizontal className="w-4 h-4" />
                    <span>Filters</span>
                  </button>
                {/* </Dialog.Trigger> */}
                <Dialog.Portal>
                  <Dialog.Overlay className="fixed font-publicSans inset-0 bg-black/50 z-50" />
                  <Dialog.Content className="fixed inset-0 m-auto bottom-0 z-50 bg-white rounded-t-[10px] h-[90vh] w-full max-w-md justify-center overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between p-4 border-b">
                      <Dialog.Close className="p-2">
                        <X className="w-5 h-5" />
                      </Dialog.Close>
                      <Dialog.Title className="font-semibold">Filters</Dialog.Title>
                      <div className="w-9" /> {/* Spacer for alignment */}
                    </div>
          
                    <div className="overflow-y-auto flex-1 p-6">
                      <div className="space-y-8">
                        {/* Activity type */}
                        <div>
                          <h3 className="text-xl font-semibold mb-4">Activity type</h3>
                          <div className="space-y-4">
                            <label className="flex items-center gap-3">
                              <Checkbox id="art" />
                              <span>Art and culture</span>
                            </label>
                            <label className="flex items-center gap-3">
                              <Checkbox id="entertainment" />
                              <span>Entertainment</span>
                            </label>
                            <label className="flex items-center gap-3">
                              <Checkbox id="food" />
                              <span>Food and drink</span>
                            </label>
                            <label className="flex items-center gap-3">
                              <Checkbox id="sports" />
                              <span>Sports</span>
                            </label>
                            {showMoreActivity && (
                              <>
                                <label className="flex items-center gap-3">
                                  <Checkbox id="nature" />
                                  <span>Nature and outdoors</span>
                                </label>
                                <label className="flex items-center gap-3">
                                  <Checkbox id="shopping" />
                                  <span>Shopping</span>
                                </label>
                              </>
                            )}
                            <button
                              onClick={() => setShowMoreActivity(!showMoreActivity)}
                              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                            >
                              Show {showMoreActivity ? 'less' : 'more'}
                              <ChevronDown className={`w-4 h-4 transition-transform ${showMoreActivity ? 'rotate-180' : ''}`} />
                            </button>
                          </div>
                        </div>
          
                        {/* Price range */}
                        <div>
                          <h3 className="text-xl font-semibold mb-4">Price range</h3>
                          {/* <p className="text-gray-600 mb-4">The average price of an experience is ₹3,39,980.</p> */}
                          <div className="px-2">
                            <Slider
                              defaultValue={[84, 8411]}
                              max={8411}
                              min={84}
                              step={1}
                              value={priceRange}
                              onValueChange={setPriceRange}
                              className="mb-4"
                            />
                            <div className="flex justify-between">
                              <div className="rounded-full border px-4 py-2">₹{priceRange[0]}</div>
                              <div className="rounded-full border px-4 py-2">₹{priceRange[1]}+</div>
                            </div>
                          </div>
                        </div>
          
                        {/* Language offered */}
                        <div>
                          <h3 className="text-xl font-semibold mb-4">Language offered</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <label className="flex items-center gap-3">
                              <Checkbox id="english" />
                              <span>English</span>
                            </label>
                            <label className="flex items-center gap-3">
                              <Checkbox id="french" />
                              <span>French</span>
                            </label>
                            <label className="flex items-center gap-3">
                              <Checkbox id="german" />
                              <span>German</span>
                            </label>
                            <label className="flex items-center gap-3">
                              <Checkbox id="japanese" />
                              <span>Japanese</span>
                            </label>
                            {showMoreLanguage && (
                              <>
                                <label className="flex items-center gap-3">
                                  <Checkbox id="spanish" />
                                  <span>Spanish</span>
                                </label>
                                <label className="flex items-center gap-3">
                                  <Checkbox id="italian" />
                                  <span>Italian</span>
                                </label>
                              </>
                            )}
                          </div>
                          <button
                            onClick={() => setShowMoreLanguage(!showMoreLanguage)}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mt-4"
                          >
                            Show {showMoreLanguage ? 'less' : 'more'}
                            <ChevronDown className={`w-4 h-4 transition-transform ${showMoreLanguage ? 'rotate-180' : ''}`} />
                          </button>
                        </div>
          
                        {/* Time of day */}
                        <div>
                          <h3 className="text-xl font-semibold mb-4">Time of day</h3>
                          <div className="space-y-4">
                            <label className="flex items-center gap-3">
                              <Checkbox id="morning" />
                              <div>
                                <div>Morning</div>
                                <div className="text-sm text-gray-500">Starts before 12pm</div>
                              </div>
                            </label>
                            <label className="flex items-center gap-3">
                              <Checkbox id="afternoon" />
                              <div>
                                <div>Afternoon</div>
                                <div className="text-sm text-gray-500">Starts after noon</div>
                              </div>
                            </label>
                            <label className="flex items-center gap-3">
                              <Checkbox id="evening" />
                              <div>
                                <div>Evening</div>
                                <div className="text-sm text-gray-500">Starts after 5pm</div>
                              </div>
                            </label>
                          </div>
                        </div>
          
                        {/* Accessibility features */}
                        <div>
                          <h3 className="text-xl font-semibold mb-4">Accessibility features</h3>
                          <div className="space-y-6">
                            <div>
                              <h4 className="font-medium mb-3">Mobility</h4>
                              <div className="space-y-4">
                                <label className="flex items-center gap-3">
                                  <Checkbox id="no-stairs" />
                                  <span>No stairs or steps</span>
                                </label>
                                <label className="flex items-center gap-3">
                                  <Checkbox id="accessible-bathroom" />
                                  <span>Accessible bathroom</span>
                                </label>
                                <label className="flex items-center gap-3">
                                  <Checkbox id="accessible-parking" />
                                  <span>Accessible parking spot</span>
                                </label>
                                <label className="flex items-center gap-3">
                                  <Checkbox id="flat-ground" />
                                  <span>Mainly flat or levelled ground</span>
                                </label>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium mb-3">Communication</h4>
                              <div className="space-y-4">
                                <label className="flex items-center gap-3">
                                  <Checkbox id="audio-info" />
                                  <span>Detailed audio or verbal information</span>
                                </label>
                                <label className="flex items-center gap-3">
                                  <Checkbox id="sign-language" />
                                  <span>Sign language</span>
                                </label>
                                <label className="flex items-center gap-3">
                                  <Checkbox id="deaf-aware" />
                                  <span>Deaf aware techniques</span>
                                </label>
                                <label className="flex items-center gap-3">
                                  <Checkbox id="sighted-guide" />
                                  <span>Designated sighted guide</span>
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
          
                    <div className="border-t p-4 flex items-center justify-between">
                      <button
                        onClick={() => setOpen(false)}
                        className="font-medium hover:underline"
                      >
                        Clear all
                      </button>
                      <button
                        onClick={() => setOpen(false)}
                        className="bg-primaryGreen text-white rounded-lg px-6 py-3 font-medium"
                      >
                        Show 273 results
                      </button>
                    </div>
                  </Dialog.Content>
                </Dialog.Portal>
              </Dialog.Root>
            )
          }
    )
}