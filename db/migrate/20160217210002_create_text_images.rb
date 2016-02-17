class CreateTextImages < ActiveRecord::Migration[5.0]
  def change
    create_table :text_images do |t|
      t.integer :text_id
      t.integer :image_id
      t.boolean :today, default: true
      t.boolean :tomorrow, default: false
      t.boolean :yesterday, default: false

      t.timestamps null: false
    end
  end
end
