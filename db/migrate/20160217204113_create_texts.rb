class CreateTexts < ActiveRecord::Migration[5.0]
  def change
    create_table :texts do |t|
      t.string :content, null: false

      t.timestamps null: false
    end
  end
end
